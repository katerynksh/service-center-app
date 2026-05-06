import OrderModel from '../models/Order.js';
import UserModel from '../models/User.js';
import { Op } from 'sequelize';

export const getDashboard = async (req, res) => {
    try {
        const masterId = req.user.id;
        
        // const masterId = 2; //тестовий майстер

        const { search, category } = req.query;

        let newOrders = await OrderModel.getNewOrders();
        let myOrders = await OrderModel.getOrdersByMaster(masterId);

        if (search && search.trim() !== '') {
            const searchTerm = search.toLowerCase();
            const filterCategory = category || 'description'; // Категорія за замовчуванням

            const filterFn = (order) => {
                const value = order[filterCategory] ? String(order[filterCategory]).toLowerCase() : '';
                return value.includes(searchTerm);
            };

            newOrders = newOrders.filter(filterFn);
            myOrders = myOrders.filter(filterFn);
        }
        res.json({ 
            newOrders: newOrders || [], 
            myOrders: myOrders || [],
            search,    // Повертаємо назад, щоб відобразити в полі пошуку
            category
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ error: 'Server error' });
    }
};
export const getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await OrderModel.getOrderDetails(id);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comment, cost } = req.body;
        
        const currentOrder = await OrderModel.getOrderById(id);
        
        const updatedStatus = status || currentOrder.status;
        const updatedComment = comment !== undefined ? comment : currentOrder.technician_comment;
        const updatedCost = cost !== undefined ? cost : currentOrder.cost;

        const updated = await OrderModel.updateStatus(id, updatedStatus, updatedComment, updatedCost);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
// export const updateOrder = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { status, comment, cost } = req.body;
//         const updated = await OrderModel.updateStatus(id, status, comment, cost);
//         res.json(updated);
//     } catch (error) {
//         res.status(500).json({ error: 'Server error' });
//     }
// };
export const acceptOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const orderId = req.params.id;
        // const masterId = 2; 
        const masterId = req.user.id; 

        const updatedOrder = await OrderModel.assignToMaster(orderId, masterId);

        res.json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error accepting order' });
    }
};