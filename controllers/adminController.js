import { OrderModel } from '../models/Order.js';
import pool from '../config/db.js';

export const getAllData = async (req, res) => {
    try {
        const orders = await OrderModel.getAllOrders();
        const masters = await OrderModel.getMasterStatus(); 
        res.json({ orders, masters });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const assignToMaster = async (req, res) => {
    try {
        const { orderId, masterId } = req.body;
        const updated = await OrderModel.assignMaster(orderId, masterId);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};