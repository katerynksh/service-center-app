import express from 'express';
import { getMyOrders, createOrder } from '../controllers/clientController.js';
import { setUser, isClient } from '../middleware/authMiddleware.js';
const router = express.Router();

// Сторінки (GET)
router.get ('/orders', setUser, isClient, getMyOrders);

router.get('/create', setUser, isClient, (req, res) => {
    const clientId = req.query.clientId;
    res.render('client/create-order', {
        title: 'Create a request - Service Center',
        clientId: clientId
    });
});

// Дії (POST)
router.post('/create', setUser, isClient, createOrder);

export default router;