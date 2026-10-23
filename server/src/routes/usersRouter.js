import express from 'express';
import usersController from '../controllers/usersController.js';
import { requireGuestRegister } from '../middlewares/settings.js';
import { registerLimiter } from '../middlewares/rateLimit.js';

const router = express.Router();

router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);
router.post('/new', requireGuestRegister, registerLimiter, usersController.newUser);

export default router;
