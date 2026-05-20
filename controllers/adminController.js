import e from 'express';
import { OrderModel } from '../models/Order.js';
import UserModel from '../models/User.js';

export const getAllData = async (req, res) => {
    try {
        const orders = await OrderModel.getAllOrders();
        const masters = await OrderModel.getMasterStatus(); 
        res.json({ orders, masters });
    } catch (error) {
        console.error("GetAllData error:", error);
        // res.status(500).json({ error: 'Server error' });
        next(error);
    }
};

export const assignToMaster = async (req, res) => {
    try {
        const { orderId, masterId } = req.body;
        const updated = await OrderModel.assignMaster(orderId, masterId);
        res.json(updated);
    } catch (error) {
        console.error("AssignToMaster error:", error);
        next(error);
    }
};
export const assignMaster = async (req, res, next) => {
    try {
        const { orderId, masterEmail } = req.body;
        
        if (!orderId || !masterEmail) {
            return res.status(400).json({ error: 'Order ID and Master Email are required' });
        }
        const updatedOrder = await OrderModel.assignMasterByEmail(orderId, masterEmail);
        
        res.json(updatedOrder);
    } catch (error) {
        console.error("Assign error:", error.message);
        next(error);
    }
};
export const createOrderAdmin = async (req, res, next) => {
    try {
        const { 
            client_email, 
            client_name, 
            client_password, 
            device_type, 
            device_model, 
            os_version, 
            issue_description,
            date_of_purchase
        } = req.body;

        const errors = {}; 

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!client_email || !emailRegex.test(client_email)) {
            errors.client_email = 'Please enter a valid email address (e.g., name@mail.com)';
        }

        const nameRegex = /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s\-\']+$/;
        if (!client_name || !nameRegex.test(client_name)) {
            errors.client_name = 'Name should only contain letters, spaces, hyphens, and apostrophes';
        } else if (client_name.length < 2) {
            errors.client_name = 'Client name must be at least 2 characters long';
        }

        if (!client_password || client_password.length < 6) {
            errors.client_password = 'Password must be at least 6 characters long';
        }

        if (issue_description) {
            const forbiddenCharsRegex = /[<>\[\]{}'"]/;
            if (forbiddenCharsRegex.test(issue_description)) {
                errors.issue_description = 'Issue description contains invalid characters (< > [ ] { } \' ")';
            } else if (issue_description.length < 10 || issue_description.length > 5000) {
                errors.issue_description = 'Issue description must be between 10 and 5000 characters';
            }
        }

        if (date_of_purchase) {
            const selectedDate = new Date(date_of_purchase);
            const today = new Date();
            const minDate = new Date('1900-01-01');
            today.setHours(23, 59, 59, 999);
            if (selectedDate > today || selectedDate < minDate) {
                errors.date_of_purchase = 'Invalid purchase date. Must be between 1900 and today.';
            }
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors }); 
        }

        const newUser = await UserModel.createUser({
            email: client_email,
            name: client_name,
            password: client_password, 
            role: 'client'
        });

        const finalDateOfPurchase = date_of_purchase ? date_of_purchase : null;
        const newOrder = await OrderModel.createNewOrder({
            client_id: newUser.id,
            device_type,
            device_model,
            os_version,
            issue_description,
            date_of_purchase: finalDateOfPurchase
        });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error("Error creating order:", error.message);
        
        if (error.message.includes('duplicate key') || error.message.includes('users_email_key')) {
            return res.status(400).json({ 
                errors: { client_email: 'User with this email already exists! Please use a different email.' }
            });
        }

        res.status(500).json({ error: 'Internal server error while creating order.' });
    }
};

export const updateOrderFull = async (req, res, next) => {
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

        if (cost !== undefined && cost !== null && cost !== "") {
            const parsedCost = Number(cost); 
            if (isNaN(parsedCost)) {
                return res.status(400).json({ error: 'Cost must be a valid number (e.g. 15.50)' });
            }
            if (parsedCost < 0) {
                return res.status(400).json({ error: 'Cost cannot be negative' });
            }
        }

        const forbiddenCharsRegex = /[<>\[\]{}'"]/;

        if (technician_comment) {
            if (forbiddenCharsRegex.test(technician_comment)) {
                return res.status(400).json({ error: 'Comment contains invalid characters (< > [ ] { } \' ")' });
            }
            if (technician_comment.length < 5 || technician_comment.length > 500) {
                return res.status(400).json({ error: 'Comment must be between 5 and 500 characters' });
            }
        }

        if (issue_description) {
            if (forbiddenCharsRegex.test(issue_description)) {
                return res.status(400).json({ error: 'Issue description contains invalid characters' });
            }
            if (issue_description.length < 10 || issue_description.length > 1000) {
                return res.status(400).json({ error: 'Issue description must be between 10 and 1000 characters' });
            }
        }

        const updated = await OrderModel.updateFullOrder(orderId, {
            device_type,
            device_model,
            os_version,
            issue_description,
            status,
            cost: cost || 0,
            assigned_to: assigned_to === "" ? null : assigned_to, 
            technician_comment
        });

        res.json(updated);
    } catch (error) {
        console.error("Update Error:", error);
        
        // Зловлюємо помилку бази даних щодо неправильного формату чисел
        if (error.message.includes('invalid input syntax for type numeric')) {
            return res.status(400).json({ error: 'Cost field contains an invalid number format' });
        }
        
        next(error);
    }
};

export const updateOrderAdmin = async (req, res, next) => {
    try {
        const updated = await OrderModel.updateFullOrder(req.params.id, req.body);
        res.json(updated);
    } catch (error) {
        // res.status(500).json({ error: 'Error updating order' });
        next(error);
    }
};

export const deleteOrder = async (req, res, next) => {
    try {
        await OrderModel.deleteOrder(req.params.id);
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error("Delete Error:", error);
        // res.status(500).json({ error: 'Error deleting order' });
        next(error);
    }
};

export const getEditPage = async (req, res, next) => {
    try {
        const order = await OrderModel.getOrderDetails(req.params.id);
        const masters = await OrderModel.getAllMasters();
        res.render('admin/editOrderAdmin', { order, masters });
    } catch (error) {
        console.error("Error loading edit page:", error);
        // res.status(500).send('Error loading edit page');
        next(error);
    }
};

export const createMaster = async (req, res, next) => {
    try {
        console.log("Create Master - Received data:", req.body);
        const { email, name, password } = req.body;

        if (!email || !name || !password) {
            console.error(error);
            return res.status(400).json({ error: 'Email, name, and password are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please enter a valid email address' });
        }

        const nameRegex = /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s\-\']+$/;
        if (!nameRegex.test(name)) {
            return res.status(400).json({ error: 'Name should only contain letters, spaces, hyphens, and apostrophes' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        const newMaster = await UserModel.createUser({
            email,
            name,
            password,
            role: 'master'
        });

        res.status(201).json(newMaster);
    } catch (error) {
        console.error("Create Master Error:", error);
        // res.status(500).json({ error: 'User already exists or data is invalid' });
        next(error);
    }
};