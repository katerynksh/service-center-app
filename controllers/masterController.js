import OrderModel from '../models/Order.js';
import UserModel from '../models/User.js';
import { Op } from 'sequelize';

export const getDashboard = async (req, res, next) => {
    try {
        const masterId = req.user.id;
        

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
        // res.status(500).json({ error: 'Server error' });
        next(error); 
    }
};
export const getOrderDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await OrderModel.getOrderDetails(id);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order details:', error);
        // res.status(500).json({ error: 'Server error' });
        next(error);
    }
};

export const updateOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, comment, cost } = req.body;

        // Більш сувора перевірка ціни
        if (cost !== undefined && cost !== null && cost !== "") {
            const parsedCost = Number(cost);
            if (isNaN(parsedCost)) {
                return res.status(400).json({ error: 'Cost must be a valid number' });
            }
            if (parsedCost < 0) {
                return res.status(400).json({ error: 'Cost cannot be negative' });
            }
        }

        if (comment !== undefined && comment !== null && comment !== "") {
            const forbiddenCharsRegex = /[<>\[\]{}'"]/;
            if (forbiddenCharsRegex.test(comment)) {
                return res.status(400).json({ error: 'Comment contains invalid characters (< > [ ] { } \' ")' });
            }
            if (comment.length < 5 || comment.length > 500) {
                return res.status(400).json({ error: 'Comment must be between 5 and 500 characters' });
            }
        }

        const currentOrder = await OrderModel.getOrderById(id);
        
        const updatedStatus = status || currentOrder.status;
        const updatedComment = comment !== undefined ? comment : currentOrder.technician_comment;
        const updatedCost = cost !== undefined ? cost : currentOrder.cost;

        const updated = await OrderModel.updateStatus(id, updatedStatus, updatedComment, updatedCost);
        res.json(updated);
    } catch (error) {
        console.error("Master Update Error:", error);

        // Перехоплення помилки формату чисел від бази даних
        if (error.message.includes('invalid input syntax for type numeric')) {
            return res.status(400).json({ error: 'Cost field contains an invalid number format' });
        }

        next(error);
    }
};

export const acceptOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const orderId = req.params.id;
        // const masterId = 2; 
        const masterId = req.user.id; 

        const updatedOrder = await OrderModel.assignToMaster(orderId, masterId);

        res.json(updatedOrder);
    } catch (error) {
        console.error(error);
        // res.status(500).json({ error: 'Error accepting order' });
        next(error);
    }
};