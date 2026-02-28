import { verifyAccessToken } from '../utils/JWT.js';
import User from '../models/User.js';

const { ROLES, MODES, ACCOUNT_STATUS } = User;

// ─────────────────────────────────────────────────────────────
// LAYER 1: Role-Based Access Control (RBAC)
// ─────────────────────────────────────────────────────────────

/**
 * protect — Verify JWT, load user, block banned/suspended.
 */
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    if (user.status === ACCOUNT_STATUS.BANNED) {
      return res.status(403).json({ success: false, message: 'Account has been permanently banned' });
    }
    if (user.status === ACCOUNT_STATUS.SUSPENDED) {
      return res.status(403).json({ success: false, message: 'Account is suspended' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

/**
 * authorize(...roles) — Restrict route to specific roles.
 * e.g. authorize('admin') or authorize('user', 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Your account role '${req.user.role}' is not authorized for this action`,
      });
    }
    next();
  };
};

/**
 * adminOnly — Shorthand for authorize('admin')
 */
const adminOnly = authorize(ROLES.ADMIN);

// ─────────────────────────────────────────────────────────────
// LAYER 2: Capability-Based Access Control
//
// These middleware check DERIVED CAPABILITIES, not roles.
// A user gains guardian capability simply by having linked children.
// No role change is needed.
// ─────────────────────────────────────────────────────────────

/**
 * requireGuardianCapability — Allows access only if:
 *   role = user AND childLinks.length > 0
 *
 * This is the guardian capability gate. It unlocks:
 *   - Guardian dashboard
 *   - Child monitoring routes
 *   - Restriction control routes
 *   - Screen time management
 *
 * Admins bypass this check (they can access everything).
 */
const requireGuardianCapability = (req, res, next) => {
  const user = req.user;

  if (user.role === ROLES.ADMIN) return next(); // admins always pass

  const isGuardian = user.role === ROLES.USER && (user.childLinks?.length || 0) > 0;
  if (!isGuardian) {
    return res.status(403).json({
      success: false,
      message: 'Guardian capability required. Link a child account to unlock this feature.',
      code: 'GUARDIAN_CAPABILITY_REQUIRED',
    });
  }
  next();
};

/**
 * blockYouthMode — Prevents youth-mode users from accessing adult routes.
 * Enforced at backend level — cannot be bypassed by frontend.
 */
const blockYouthMode = (req, res, next) => {
  if (req.user.mode === MODES.YOUTH) {
    return res.status(403).json({
      success: false,
      message: 'This feature is not available in Youth Mode',
      code: 'YOUTH_MODE_RESTRICTED',
    });
  }
  next();
};

/**
 * youthModeOnly — Restrict route to youth mode users only (e.g. child-specific APIs).
 */
const youthModeOnly = (req, res, next) => {
  if (req.user.mode !== MODES.YOUTH) {
    return res.status(403).json({
      success: false,
      message: 'This route is for youth mode accounts only',
    });
  }
  next();
};

/**
 * requireEmailVerified — Block unverified users from sensitive actions.
 */
const requireEmailVerified = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email to continue',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }
  next();
};

/**
 * requireGuardianApproval — Block child accounts that haven't been approved yet.
 */
const requireGuardianApproval = (req, res, next) => {
  if (req.user.role === ROLES.CHILD && !req.user.guardianApprovedAt) {
    return res.status(403).json({
      success: false,
      message: 'Account is pending guardian approval',
      code: 'PENDING_GUARDIAN_APPROVAL',
    });
  }
  next();
};

/**
 * requireOwnerOrAdmin — User can only access their own resource, or admin can access any.
 * Usage: router.get('/:id', protect, requireOwnerOrAdmin('id'))
 */
const requireOwnerOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    const targetId = req.params[paramName];
    if (req.user.role === ROLES.ADMIN) return next();
    if (req.user._id.toString() === targetId) return next();
    return res.status(403).json({ success: false, message: 'Not authorized to access this resource' });
  };
};

export {
  protect,
  authorize,
  adminOnly,
  requireGuardianCapability,
  blockYouthMode,
  youthModeOnly,
  requireEmailVerified,
  requireGuardianApproval,
  requireOwnerOrAdmin,
};
