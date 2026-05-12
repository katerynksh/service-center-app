import express from 'express';
import * as authController from '../controllers/authController.js';
import { registrationMiddleware, loginMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();

// Сторінки (GET)
router.get('/login', authController.getLoginView);
router.get('/register', authController.getRegisterView);
router.get('/logout', authController.logout);

// Дії (POST)
router.post('/register', registrationMiddleware, authController.register);
router.post('/login', loginMiddleware, authController.login);

export default router;