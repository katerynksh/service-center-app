import { OrderModel } from '../models/Order.js';

export const getDashboard = async (req, res) => {
    try {
        // const masterId = req.user.id;
        
        const masterId = 2; //тестовий майстер
        const newOrders = await OrderModel.getNewOrders();
        const myOrders = await OrderModel.getOrdersByMaster(masterId);
        res.json({ 
            newOrders: newOrders || [], 
            myOrders: myOrders || []
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
        const masterId = 2; 
        // const masterId = req.user.id; // У реальному режимі отримуємо ID майстра з токена

        const updated = await OrderModel.assignMaster(id, masterId);
        
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Помилка при прийнятті замовлення' });
    }
};