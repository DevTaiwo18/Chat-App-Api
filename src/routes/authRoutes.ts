import express from 'express';
import { signup, login, verifyEmail, forgotPassword, resetPassword } from '../controllers/authController';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;