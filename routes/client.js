import express from 'express';
import { getMyOrders, createOrder, getCreateOrderView } from '../controllers/clientController.js';
import { setUser, isClient } from '../middleware/authMiddleware.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(setUser);
router.use(authMiddleware);

// Сторінки (GET)
router.get('/dashboard', isClient, getMyOrders);

router.get('/create', isClient, getCreateOrderView);

// Дії (POST)
router.post('/create', isClient, createOrder);

export default router;