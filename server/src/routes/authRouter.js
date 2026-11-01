import express from 'express';
import authController from '../controllers/authController.js';
import { requireLogin } from '../middlewares/auth.js';
import { loginLimiter, registerLimiter } from '../middlewares/rateLimit.js';
import { requireGuestRegister } from '../middlewares/settings.js';

const router = express.Router();

router.get('/config', authController.getConfig);
router.get('/me', requireLogin, authController.me);
router.post('/register', requireGuestRegister, registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/logout', authController.logout);

export default router;
