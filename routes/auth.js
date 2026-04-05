import express from 'express';
import * as authController from '../controllers/authController.js';
const router = express.Router();

// Сторінки (GET)
router.get('/login', (req, res) => res.render('auth/login', { title: 'Login - Service Center' }));
router.get('/register', (req, res) => res.render('auth/register', { title: 'Sign Up - Service Center' }));

// Дії (POST)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

export default router;
