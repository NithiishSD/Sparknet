import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Generate access token.
 *
 * Payload design (capability-based):
 *   userId       — identity
 *   role         — child | user | admin
 *   mode         — normal | youth
 *   isGuardian   — CAPABILITY FLAG: true when role=user and has linked children
 *   hasChildren  — boolean shorthand (same as isGuardian)
 *   linkedChildrenCount — how many children linked
 *   guardianId   — set when role=child, points to guardian user
 *   status       — current account status
 *
 * Frontend and backend middleware use isGuardian to unlock guardian routes
 * WITHOUT any role change.
 */
const generateAccessToken = (user) => {
  const isGuardian = user.role === 'user' && (user.childLinks?.length || 0) > 0;

  const payload = {
    userId: user._id,
    role: user.role,
    mode: user.mode,
    isGuardian,
    hasChildren: isGuardian,
    linkedChildrenCount: user.childLinks?.length || 0,
    guardianId: user.guardianId || null,
    status: user.status,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
};

/**
 * Generate opaque refresh token (stored hashed in DB)
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const hashRefreshToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  hashRefreshToken,
};
