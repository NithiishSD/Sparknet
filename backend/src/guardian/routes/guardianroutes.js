const express = require('express');
const router = express.Router();
const {
  approveChild,
  getChildren,
  updateChildControls,
  setChildStatus,
  unlinkChild,
  getChildActivity,
  resendGuardianInvite,
} = require('../controllers/guardiancontroller');
const { protect, requireGuardianCapability, requireEmailVerified } = require('../../middleware/auth');

// Public: guardian approves child via email link
router.post('/approve/:token', approveChild);
router.post('/resend-invite', resendGuardianInvite);

// Protected: requires guardian CAPABILITY (not a role — derived from having linked children)
router.use(protect, requireEmailVerified, requireGuardianCapability);

router.get('/children', getChildren);
router.patch('/children/:childId/controls', updateChildControls);
router.patch('/children/:childId/status', setChildStatus);
router.delete('/children/:childId', unlinkChild);
router.get('/children/:childId/activity', getChildActivity);

module.exports = router;
