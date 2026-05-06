import { OrderModel } from '../models/Order.js';
import UserModel from '../models/User.js';
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
export const assignMaster = async (req, res) => {
    try {
        const { orderId, masterEmail } = req.body;
        
        if (!orderId || !masterEmail) {
            return res.status(400).json({ error: 'Order ID and Master Email are required' });
        }
        const updatedOrder = await OrderModel.assignMasterByEmail(orderId, masterEmail);
        
        res.json(updatedOrder);
    } catch (error) {
        console.error("Assign error:", error.message);
        res.status(400).json({ error: error.message });
    }
};
export const createOrderAdmin = async (req, res) => {
    try {
        const { client_email, client_password, device_type, device_model, os_version, issue_description } = req.body;

        // 1. Створюємо клієнта з паролем, який ввів адмін
        const newUser = await UserModel.createUser({
            email: client_email,
            password: client_password, // Передаємо введений пароль
            role: 'client'
        });

        // 2. Створюємо замовлення
        const newOrder = await OrderModel.createNewOrder({
            client_id: newUser.id,
            device_type,
            device_model,
            os_version,
            issue_description
        });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error("Error creating order:", error.message);
        res.status(500).json({ error: 'Failed to create order, maybe this user already exists' });
    }
};
// export const assignMaster = async (req, res) => {
//     try {
//         const { orderId, masterEmail } = req.body;
//         // Перевіряємо, чи замовлення належить саме цьому клієнту (безпека)
//         const order = await OrderModel.getOrderById(orderId);
        
//         if (!order || order.client_id !== req.user.id) {
//             return res.status(403).json({ error: 'Доступ заборонено' });
//         }

//         const updatedOrder = await OrderModel.assignMasterByEmail(orderId, masterEmail);
//         res.json(updatedOrder);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };
// export const updateOrderFull = async (req, res) => {
//     try {
//         const updated = await OrderModel.updateFullOrder(req.params.id, req.body);
//         res.json(updated);
//     } catch (error) {
//         console.error("Error updating order:", error.message);
//         res.status(500).json({ error: 'Error updating order' });
//     }
// };

export const updateOrderFull = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { 
            device_type, 
            device_model, 
            os_version, 
            issue_description, 
            status, 
            cost, 
            assigned_to, 
            technician_comment 
        } = req.body;

        const updated = await OrderModel.updateFullOrder(orderId, {
            device_type,
            device_model,
            os_version,
            issue_description,
            status,
            cost: cost || 0,
            assigned_to: assigned_to === "" ? null : assigned_to, // Обробка порожнього значення
            technician_comment
        });

        res.json(updated);
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: 'Failed to update order' });
    }
};

export const updateOrderAdmin = async (req, res) => {
    try {
        const updated = await OrderModel.updateFullOrder(req.params.id, req.body);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Error updating order' });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        await OrderModel.deleteOrder(req.params.id);
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting order' });
    }
};

export const getEditPage = async (req, res) => {
    try {
        const order = await OrderModel.getOrderDetails(req.params.id);
        const masters = await OrderModel.getAllMasters();
        res.render('admin/editOrderAdmin', { order, masters });
    } catch (error) {
        res.status(500).send('Error loading edit page');
    }
};

export const createMaster = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const newMaster = await UserModel.createUser({
            email,
            password,
            role: 'master'
        });

        res.status(201).json(newMaster);
    } catch (error) {
        console.error("Create Master Error:", error.message);
        res.status(500).json({ error: 'User already exists or data is invalid' });
    }
};