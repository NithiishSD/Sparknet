const express = require('express');
const router = express.Router();
const {
  getUsers, getUser, updateUserStatus,
  forceLogout, getUserActivity, setUserMode, getStats,
} = require('../controllers/admincontroller');
const { protect, adminOnly } = require('../../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id/status', updateUserStatus);
router.post('/users/:id/force-logout', forceLogout);
router.get('/users/:id/activity', getUserActivity);
router.patch('/users/:id/mode', setUserMode);

module.exports = router;
