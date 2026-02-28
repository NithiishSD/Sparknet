import crypto from 'crypto';
import User from '../../models/User.js';
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from '../../utils/Jwt.js';
import { validatePassword, validateAge, isMinor } from '../../utils/Validators.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendGuardianInviteEmail,
} from '../../utils/Email.js';

const { ROLES, MODES, ACCOUNT_STATUS } = User;

const getDeviceInfo = (req) => req.headers['user-agent'] || 'Unknown';
const getIp = (req) => req.ip || req.connection?.remoteAddress || 'unknown';

// ─── Helper: attach sessions & send token response ────────────
const sendTokenResponse = async (user, statusCode, res, req) => {
  const accessToken = generateAccessToken(user);
  const rawRefreshToken = generateRefreshToken();
  const hashedRefresh = hashRefreshToken(rawRefreshToken);

  user.sessions.push({
    refreshToken: hashedRefresh,
    device: getDeviceInfo(req),
    ip: getIp(req),
  });

  // Cap at 5 concurrent sessions
  if (user.sessions.length > 5) {
    user.sessions = user.sessions.slice(-5);
  }

  await user.save({ validateBeforeSave: false });

  res
    .status(statusCode)
    .cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    })
    .cookie('refreshToken', rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        mode: user.mode,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        // Capability fields in response
        isGuardian: user.role === ROLES.USER && (user.childLinks?.length || 0) > 0,
        hasChildren: user.role === ROLES.USER && (user.childLinks?.length || 0) > 0,
        linkedChildrenCount: user.childLinks?.length || 0,
      },
    });
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// ─────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { username, email, password, dateOfBirth, guardianEmail, termsAccepted } = req.body;

    if (!username || !email || !password || !dateOfBirth) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!termsAccepted) {
      return res.status(400).json({ success: false, message: 'You must accept the terms and privacy policy' });
    }

    const pwErrors = validatePassword(password);
    if (pwErrors.length > 0) {
      return res.status(400).json({ success: false, message: 'Password too weak', errors: pwErrors });
    }

    const ageCheck = validateAge(dateOfBirth, 5);
    if (!ageCheck.valid) {
      return res.status(400).json({ success: false, message: ageCheck.message });
    }

    const minor = isMinor(dateOfBirth);

    // ARCHITECTURE: child is detected by age, not by user selecting "parent" role
    const resolvedRole = minor ? ROLES.CHILD : ROLES.USER;
    const resolvedMode = minor ? MODES.YOUTH : MODES.NORMAL;

    // Children must supply a guardian email
    if (resolvedRole === ROLES.CHILD && !guardianEmail) {
      return res.status(400).json({ success: false, message: 'Guardian email is required for child accounts' });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email.toLowerCase() ? 'Email' : 'Username';
      return res.status(409).json({ success: false, message: `${field} is already in use` });
    }

    const initialStatus =
      resolvedRole === ROLES.CHILD
        ? ACCOUNT_STATUS.PENDING_GUARDIAN_APPROVAL
        : ACCOUNT_STATUS.PENDING_VERIFICATION;

    const user = await User.create({
      username,
      email,
      password,
      dateOfBirth,
      role: resolvedRole,
      mode: resolvedMode,
      status: initialStatus,
      termsAcceptedAt: new Date(),
      privacyAcceptedAt: new Date(),
    });

    // Email verification token
    const verifyToken = user.generateEmailVerificationToken();

    if (resolvedRole === ROLES.CHILD) {
      const inviteToken = user.generateGuardianInviteToken(guardianEmail);
      await user.save({ validateBeforeSave: false });
      await sendGuardianInviteEmail(guardianEmail, username, inviteToken);
    } else {
      await user.save({ validateBeforeSave: false });
    }

    await sendVerificationEmail(email, verifyToken);

    res.status(201).json({
      success: true,
      message:
        resolvedRole === ROLES.CHILD
          ? 'Account created. Verify your email and ask your guardian to approve your account.'
          : 'Account created. Please check your email to verify.',
      role: resolvedRole,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// ─────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isLocked) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${minutesLeft} minute(s).`,
        code: 'ACCOUNT_LOCKED',
      });
    }

    const isMatch = await user.comparePassword(password);
    const ip = getIp(req);
    const device = getDeviceInfo(req);

    if (!isMatch) {
      await user.incrementLoginAttempts();
      user.loginHistory.push({ ip, device, success: false });
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === ACCOUNT_STATUS.BANNED) {
      return res.status(403).json({ success: false, message: 'Account permanently banned' });
    }
    if (user.status === ACCOUNT_STATUS.SUSPENDED) {
      return res.status(403).json({ success: false, message: 'Account suspended' });
    }
    if (user.status === ACCOUNT_STATUS.PENDING_VERIFICATION) {
      return res.status(403).json({ success: false, message: 'Please verify your email first', code: 'EMAIL_NOT_VERIFIED' });
    }
    if (user.status === ACCOUNT_STATUS.PENDING_GUARDIAN_APPROVAL) {
      return res.status(403).json({ success: false, message: 'Account awaiting guardian approval', code: 'PENDING_GUARDIAN_APPROVAL' });
    }

    await user.resetLoginAttempts();
    user.lastLoginAt = new Date();
    user.lastLoginIp = ip;
    user.loginHistory.push({ ip, device, success: true });
    if (user.loginHistory.length > 50) user.loginHistory = user.loginHistory.slice(-50);

    await sendTokenResponse(user, 200, res, req);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/refresh
// ─────────────────────────────────────────────────────────────
export const refreshToken = async (req, res) => {
  try {
    const rawToken = req.cookies?.refreshToken;
    if (!rawToken) return res.status(401).json({ success: false, message: 'No refresh token' });

    const hashed = hashRefreshToken(rawToken);
    const user = await User.findOne({ 'sessions.refreshToken': hashed });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });

    if ([ACCOUNT_STATUS.BANNED, ACCOUNT_STATUS.SUSPENDED].includes(user.status)) {
      return res.status(403).json({ success: false, message: 'Account access denied' });
    }

    // Rotate: remove old session
    user.sessions = user.sessions.filter((s) => s.refreshToken !== hashed);
    await sendTokenResponse(user, 200, res, req);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/logout
// ─────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    const rawToken = req.cookies?.refreshToken;
    if (rawToken) {
      const hashed = hashRefreshToken(rawToken);
      await User.findByIdAndUpdate(req.user._id, { $pull: { sessions: { refreshToken: hashed } } });
    }
    res.clearCookie('accessToken').clearCookie('refreshToken').json({ success: true, message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/logout-all
// ─────────────────────────────────────────────────────────────
export const logoutAll = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { sessions: [] } });
    res.clearCookie('accessToken').clearCookie('refreshToken').json({ success: true, message: 'Logged out from all devices' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/auth/verify-email/:token
// ─────────────────────────────────────────────────────────────
export const verifyEmail = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashed,
      emailVerificationExpires: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired link' });

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    // Activate adult users; children still need guardian approval
    if (user.role !== ROLES.CHILD) {
      user.status = ACCOUNT_STATUS.ACTIVE;
    }

    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/resend-verification
// ─────────────────────────────────────────────────────────────
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+emailVerificationToken +emailVerificationExpires');
    if (!user || user.isEmailVerified) {
      return res.json({ success: true, message: 'If that email exists and is unverified, a link was sent' });
    }
    const token = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    await sendVerificationEmail(email, token);
    res.json({ success: true, message: 'Verification email sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    res.json({ success: true, message: 'If that email exists, a reset link was sent' });
    const user = await User.findOne({ email });
    if (!user) return;
    const token = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });
    await sendPasswordResetEmail(email, token);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/reset-password/:token
// ─────────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires +password');

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    const pwErrors = validatePassword(password);
    if (pwErrors.length > 0) return res.status(400).json({ success: false, message: 'Weak password', errors: pwErrors });

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.sessions = []; // Invalidate all sessions
    await user.save();
    res.json({ success: true, message: 'Password reset. Please log in.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/change-password
// ─────────────────────────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password incorrect' });

    const pwErrors = validatePassword(newPassword);
    if (pwErrors.length > 0) return res.status(400).json({ success: false, message: 'Weak password', errors: pwErrors });

    user.password = newPassword;
    user.sessions = [];
    await user.save();
    res.json({ success: true, message: 'Password changed. Please log in again.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMe = async (req, res) => {
  const user = req.user;
  const isGuardian = user.role === ROLES.USER && (user.childLinks?.length || 0) > 0;

  res.json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      mode: user.mode,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      age: user.age,
      lastLoginAt: user.lastLoginAt,
      // Guardian capability fields
      isGuardian,
      hasChildren: isGuardian,
      linkedChildrenCount: user.childLinks?.length || 0,
      // Child fields
      guardianId: user.guardianId,
      activeSessions: user.sessions?.length || 0,
    },
  });
};
