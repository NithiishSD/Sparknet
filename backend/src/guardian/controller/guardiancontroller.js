import crypto from 'crypto';
import User from '../../models/User.js';
import { sendGuardianInviteEmail, sendAccountStatusEmail } from '../../utils/Email.js';

const { ROLES, ACCOUNT_STATUS } = User;

// ─────────────────────────────────────────────────────────────
// @desc    Guardian approves child account via invite token
// @route   POST /api/guardian/approve/:token
// @access  Public
//
// ARCHITECTURE NOTE:
// The guardian is a regular USER. They gain the guardian CAPABILITY
// simply by approving this child link. No role change occurs.
// After this, isGuardian = true is computed from childLinks.length > 0.
// ─────────────────────────────────────────────────────────────
export const approveChild = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const child = await User.findOne({
      guardianInviteToken: hashed,
      guardianInviteExpires: { $gt: Date.now() },
    }).select('+guardianInviteToken +guardianInviteExpires');

    if (!child) {
      return res.status(400).json({ success: false, message: 'Invalid or expired approval link' });
    }

    const guardian = await User.findOne({ email: child.guardianInviteEmail });
    if (!guardian) {
      return res.status(400).json({
        success: false,
        message: 'Guardian account not found. Please register first, then click this link again.',
        guardianEmail: child.guardianInviteEmail,
        code: 'GUARDIAN_NOT_REGISTERED',
      });
    }

    if (guardian.role === ROLES.CHILD) {
      return res.status(400).json({
        success: false,
        message: 'A child account cannot be a guardian. Please use an adult account.',
      });
    }

    // Link child → guardian
    child.guardianId = guardian._id;
    child.guardianApprovedAt = new Date();
    child.guardianInviteToken = undefined;
    child.guardianInviteExpires = undefined;
    child.status = child.isEmailVerified
      ? ACCOUNT_STATUS.ACTIVE
      : ACCOUNT_STATUS.PENDING_VERIFICATION;
    await child.save({ validateBeforeSave: false });

    // Add child to guardian's childLinks if not already there
    const alreadyLinked = guardian.childLinks.some(
      (cl) => cl.childId.toString() === child._id.toString()
    );
    if (!alreadyLinked) {
      guardian.childLinks.push({
        childId: child._id,
        approvedAt: new Date(),
      });
      await guardian.save({ validateBeforeSave: false });
    }

    // Guardian now has childLinks.length > 0 → isGuardian capability automatically unlocked
    res.json({
      success: true,
      message: `You have approved ${child.username}'s account. Guardian dashboard is now unlocked.`,
      child: { id: child._id, username: child.username },
      guardianCapabilityUnlocked: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all linked children with their settings
// @route   GET /api/guardian/children
// @access  Private (requires guardian capability)
// ─────────────────────────────────────────────────────────────
export const getChildren = async (req, res) => {
  try {
    const guardian = await User.findById(req.user._id).populate(
      'childLinks.childId',
      'username email status mode lastLoginAt loginHistory createdAt'
    );

    const children = guardian.childLinks.map((link) => ({
      linkId: link._id,
      linkedAt: link.linkedAt,
      approvedAt: link.approvedAt,
      controls: link.controls,
      child: link.childId,
    }));

    res.json({ success: true, children, count: children.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update guardian controls for a specific child
// @route   PATCH /api/guardian/children/:childId/controls
// @access  Private (requires guardian capability)
//
// Guardian can set per-child: messaging, friend requests,
// content level, screen time limits — all without role changes.
// ─────────────────────────────────────────────────────────────
export const updateChildControls = async (req, res) => {
  try {
    const { messagingAllowed, friendRequestsAllowed, contentLevel, screenTimeLimitMinutes, screenTimeEnabled } = req.body;

    const guardian = await User.findById(req.user._id);
    const linkIndex = guardian.childLinks.findIndex(
      (cl) => cl.childId.toString() === req.params.childId
    );

    if (linkIndex === -1) {
      return res.status(404).json({ success: false, message: 'Child not found in your linked accounts' });
    }

    const controls = guardian.childLinks[linkIndex].controls;

    if (messagingAllowed !== undefined) controls.messagingAllowed = messagingAllowed;
    if (friendRequestsAllowed !== undefined) controls.friendRequestsAllowed = friendRequestsAllowed;
    if (contentLevel !== undefined) controls.contentLevel = contentLevel;
    if (screenTimeLimitMinutes !== undefined) controls.screenTimeLimitMinutes = screenTimeLimitMinutes;
    if (screenTimeEnabled !== undefined) controls.screenTimeEnabled = screenTimeEnabled;

    guardian.childLinks[linkIndex].controls = controls;
    guardian.markModified('childLinks');
    await guardian.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Child controls updated',
      controls: guardian.childLinks[linkIndex].controls,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Suspend or reactivate a child account
// @route   PATCH /api/guardian/children/:childId/status
// @access  Private (requires guardian capability)
// ─────────────────────────────────────────────────────────────
export const setChildStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = [ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.SUSPENDED];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Only active or suspended allowed' });
    }

    const guardian = await User.findById(req.user._id);
    const isLinked = guardian.childLinks.some(
      (cl) => cl.childId.toString() === req.params.childId
    );
    if (!isLinked) {
      return res.status(404).json({ success: false, message: 'Child not found in your linked accounts' });
    }

    const child = await User.findById(req.params.childId);
    if (!child) return res.status(404).json({ success: false, message: 'Child account not found' });

    child.status = status;
    if (status === ACCOUNT_STATUS.SUSPENDED) {
      child.sessions = []; // Force immediate session termination
    }
    await child.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: `${child.username}'s account is now ${status}`,
      child: { id: child._id, username: child.username, status },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Unlink a child account
// @route   DELETE /api/guardian/children/:childId
// @access  Private (requires guardian capability)
// ─────────────────────────────────────────────────────────────
export const unlinkChild = async (req, res) => {
  try {
    const guardian = await User.findById(req.user._id);
    const originalLength = guardian.childLinks.length;

    guardian.childLinks = guardian.childLinks.filter(
      (cl) => cl.childId.toString() !== req.params.childId
    );

    if (guardian.childLinks.length === originalLength) {
      return res.status(404).json({ success: false, message: 'Child not found in your linked accounts' });
    }

    await guardian.save({ validateBeforeSave: false });

    // Clear child's guardian link
    const child = await User.findById(req.params.childId);
    if (child) {
      child.guardianId = null;
      child.guardianApprovedAt = undefined;
      child.status = ACCOUNT_STATUS.SUSPENDED;
      await child.save({ validateBeforeSave: false });
    }

    const stillGuardian = guardian.childLinks.length > 0;
    res.json({
      success: true,
      message: 'Child unlinked successfully',
      isGuardian: stillGuardian, // if last child removed, capability revoked
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get child's activity log (guardian monitoring)
// @route   GET /api/guardian/children/:childId/activity
// @access  Private (requires guardian capability)
// ─────────────────────────────────────────────────────────────
export const getChildActivity = async (req, res) => {
  try {
    const guardian = await User.findById(req.user._id);
    const isLinked = guardian.childLinks.some(
      (cl) => cl.childId.toString() === req.params.childId
    );
    if (!isLinked) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this child\'s activity' });
    }

    const child = await User.findById(req.params.childId).select(
      'username loginHistory sessions lastLoginAt lastLoginIp status'
    );
    if (!child) return res.status(404).json({ success: false, message: 'Child not found' });

    res.json({
      success: true,
      activity: {
        username: child.username,
        status: child.status,
        lastLoginAt: child.lastLoginAt,
        lastLoginIp: child.lastLoginIp,
        activeSessions: child.sessions?.length || 0,
        loginHistory: child.loginHistory.slice(-30),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Resend guardian invite for a child
// @route   POST /api/guardian/resend-invite
// @access  Public
// ─────────────────────────────────────────────────────────────
export const resendGuardianInvite = async (req, res) => {
  try {
    const { childId, guardianEmail } = req.body;
    const child = await User.findById(childId).select('+guardianInviteToken +guardianInviteExpires');
    if (!child || child.role !== ROLES.CHILD) {
      return res.status(404).json({ success: false, message: 'Child account not found' });
    }

    const inviteToken = child.generateGuardianInviteToken(guardianEmail);
    await child.save({ validateBeforeSave: false });
    await sendGuardianInviteEmail(guardianEmail, child.username, inviteToken);

    res.json({ success: true, message: 'Guardian invite resent' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
