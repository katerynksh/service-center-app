import pool from '../config/db.js';

// ПЕРЕГЛЯД СВОЇХ ЗАМОВЛЕНЬ
export const getMyOrders = async (req, res) => {
    const clientId = req.query.clientId;
    try {
        const orders = await pool.query(
            'SELECT * FROM ORDERS WHERE client_id = $1 ORDER BY created_at DESC',
            [clientId]
        );
        res.render('client/my-orders', {
            orders: orders.rows,
            clientId: clientId,
            title: 'My Application History'
        });
    } catch (err) {
        res.status(500).send("Error loading history");
    }
};

// СТВОРЕННЯ ЗАМОВЛЕННЯ (POST)
export const createOrder = async (req, res) => {
    const { client_id, device_type, device_model, os_version, date_of_purchase, issue_description } = req.body;
    try {
        await pool.query(
            `INSERT INTO ORDERS (client_id, device_type, device_model, os_version, date_of_purchase, issue_description, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'new')`,
            [client_id, device_type, device_model, os_version, date_of_purchase, issue_description]
        );
        res.redirect(`/client/orders?clientId=${client_id}`);
    } catch (err) {
        res.status(500).send("Failed to create request");
    }
};