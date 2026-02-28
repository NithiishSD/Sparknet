const User = require('../../models/User');
const { sendAccountStatusEmail } = require('../../utils/email');

const { ACCOUNT_STATUS, ROLES, MODES } = User;

// ─────────────────────────────────────────────────────────────
// @route   GET /api/admin/users
// ─────────────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.mode) filter.mode = req.query.mode;
    // Filter by guardian capability: users who have at least one child linked
    if (req.query.isGuardian === 'true') filter['childLinks.0'] = { $exists: true };
    if (req.query.search) {
      filter.$or = [
        { username: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('username email role mode status createdAt lastLoginAt loginAttempts childLinks guardianId')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Add computed isGuardian to each user in response
    const usersWithCapabilities = users.map((u) => ({
      ...u.toObject(),
      isGuardian: u.role === ROLES.USER && (u.childLinks?.length || 0) > 0,
      linkedChildrenCount: u.childLinks?.length || 0,
    }));

    res.json({ success: true, total, page, pages: Math.ceil(total / limit), users: usersWithCapabilities });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/admin/users/:id
// ─────────────────────────────────────────────────────────────
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('guardianId', 'username email')
      .populate('childLinks.childId', 'username email status');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        isGuardian: user.role === ROLES.USER && (user.childLinks?.length || 0) > 0,
        linkedChildrenCount: user.childLinks?.length || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   PATCH /api/admin/users/:id/status
// ─────────────────────────────────────────────────────────────
exports.updateUserStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!Object.values(ACCOUNT_STATUS).includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === ROLES.ADMIN && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Cannot modify other admin accounts' });
    }

    const prev = user.status;
    user.status = status;

    if ([ACCOUNT_STATUS.BANNED, ACCOUNT_STATUS.SUSPENDED].includes(status)) {
      user.sessions = []; // Immediate session termination
    }

    await user.save({ validateBeforeSave: false });
    await sendAccountStatusEmail(user.email, user.username, status, reason);

    res.json({ success: true, message: `Status changed from ${prev} to ${status}`, user: { id: user._id, username: user.username, status } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/admin/users/:id/force-logout
// ─────────────────────────────────────────────────────────────
exports.forceLogout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { $set: { sessions: [] } });
    res.json({ success: true, message: 'All user sessions cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/admin/users/:id/activity
// ─────────────────────────────────────────────────────────────
exports.getUserActivity = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      'username loginHistory sessions lastLoginAt lastLoginIp role mode'
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      activity: {
        username: user.username,
        role: user.role,
        mode: user.mode,
        lastLoginAt: user.lastLoginAt,
        lastLoginIp: user.lastLoginIp,
        activeSessions: user.sessions,
        loginHistory: user.loginHistory.slice(-50),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   PATCH /api/admin/users/:id/mode
// @desc    Toggle or set mode (normal / youth) for any user
// ─────────────────────────────────────────────────────────────
exports.setUserMode = async (req, res) => {
  try {
    const { mode } = req.body;
    if (!Object.values(MODES).includes(mode)) {
      return res.status(400).json({ success: false, message: 'Mode must be normal or youth' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.mode = mode;
    user.sessions = []; // Force re-login so new token reflects updated mode
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: `Mode set to ${mode} for ${user.username}. Sessions cleared.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/admin/stats
// @desc    Platform overview stats
// ─────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalChildren, activeUsers, bannedUsers, guardians] = await Promise.all([
      User.countDocuments({ role: ROLES.USER }),
      User.countDocuments({ role: ROLES.CHILD }),
      User.countDocuments({ status: ACCOUNT_STATUS.ACTIVE }),
      User.countDocuments({ status: ACCOUNT_STATUS.BANNED }),
      // Guardians = users with at least one child link
      User.countDocuments({ role: ROLES.USER, 'childLinks.0': { $exists: true } }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalChildren,
        activeUsers,
        bannedUsers,
        guardians,
        youthModeUsers: await User.countDocuments({ mode: MODES.YOUTH }),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
