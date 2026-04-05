import express from 'express';
import * as clientController from '../controllers/clientController.js';const router = express.Router();

// Сторінки (GET)
router.get ('/orders', clientController.getMyOrders);
router.get('/create', (req, res) => {
    const clientId = req.query.clientId;
    res.render('client/create-order', {
        title: 'Create a request - Service Center',
        clientId: clientId
    });
});

// Дії (POST)
router.post('/create', clientController.createOrder);

export default router;