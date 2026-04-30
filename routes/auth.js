import express from 'express';
import * as authController from '../controllers/authController.js';
const router = express.Router();

// Сторінки (GET)
router.get('/login', authController.getLoginView);
router.get('/register', authController.getRegisterView);

// Дії (POST)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

export default router;