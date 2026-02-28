import express from 'express';
const router = express.Router();
import {
  getUsers, getUser, updateUserStatus,
  forceLogout, getUserActivity, setUserMode, getStats,
} from '../controller/admincontroller.js';
import { protect, adminOnly } from '../../middleware/Auth.js';

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id/status', updateUserStatus);
router.post('/users/:id/force-logout', forceLogout);
router.get('/users/:id/activity', getUserActivity);
router.patch('/users/:id/mode', setUserMode);

export default router;
