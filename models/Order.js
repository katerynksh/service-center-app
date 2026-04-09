import pool from '../config/db.js';

export const OrderModel = {
    // Для Майстра: бачити нові та свої
    getNewOrders: async () => {
    const res = await pool.query(`
        SELECT o.*, u.email as client_email 
        FROM ORDERS o 
        JOIN USERS u ON o.client_id = u.id 
        WHERE o.status = 'new'
    `);
    return res.rows;
    },
    getOrdersByMaster: async (masterId) => {
    const res = await pool.query(`
        SELECT o.*, u.email as client_email 
        FROM ORDERS o 
        JOIN USERS u ON o.client_id = u.id 
        WHERE o.assigned_to = $1
    `, [masterId]);
    return res.rows;
    },

    // Оновлення статусу майстром
    updateStatus: async (id, status, comment, cost) => { // Додано параметр cost
        const res = await pool.query(
            "UPDATE ORDERS SET status = $1, technician_comment = $2, cost = $3, updated_at = NOW() WHERE order_id = $4 RETURNING *",
            [status, comment, cost || 0, id] // Записуємо ціну
        );
        return res.rows[0];
    },
    takeOrder: async (orderId, masterId) => {
        const res = await pool.query(
            "UPDATE ORDERS SET assigned_to = $1, status = 'in progress', updated_at = NOW() WHERE order_id = $2 RETURNING *",
            [masterId, orderId]
        );
        return res.rows[0];
    },
    // Для Адміна: всі замовлення та всі майстри
    getAllOrders: async () => {
        const res = await pool.query(`
            SELECT o.*, u.email as master_email 
            FROM ORDERS o 
            LEFT JOIN USERS u ON o.assigned_to = u.id 
            ORDER BY o.created_at DESC
        `);
        return res.rows;
    },
    createNewOrder: async (orderData) => {
        const { 
            client_id, device_type, device_model, 
            os_version, date_of_purchase, issue_description 
        } = orderData;
    
        const res = await pool.query(
            `INSERT INTO ORDERS 
            (client_id, device_type, device_model, os_version, date_of_purchase, issue_description, status) 
            VALUES ($1, $2, $3, $4, $5, $6, 'new') 
            RETURNING *`,
            [
                client_id, device_type, device_model, 
                os_version || null, 
                date_of_purchase || null, // Обробка порожньої дати
                issue_description
            ]
        );
        return res.rows[0];
    },  
    updateFullOrder: async (id, data) => {
        const { device_type, device_model, os_version, issue_description, status, cost, assigned_to } = data;
        const res = await pool.query(
            `UPDATE ORDERS SET 
                device_type = $1, device_model = $2, os_version = $3, 
                issue_description = $4, status = $5, cost = $6, 
                assigned_to = $7, updated_at = NOW() 
             WHERE order_id = $8 RETURNING *`,
            [device_type, device_model, os_version, issue_description, status, cost, assigned_to, id]
        );
        return res.rows[0];
    },
    deleteOrder: async (id) => {
        await pool.query("DELETE FROM ORDERS WHERE order_id = $1", [id]);
        return { success: true };
    },    
    getAllMasters: async () => {
        const res = await pool.query("SELECT id, email FROM USERS WHERE role = 'master'");
        return res.rows;
    },
    assignMasterByEmail: async (orderId, masterEmail) => {
        const masterRes = await pool.query(
            "SELECT id FROM USERS WHERE email = $1 AND role = 'master'",
            [masterEmail]
        );

        if (masterRes.rows.length === 0) {
            throw new Error('Master with this email not foundor user is not a master');
        }

        const masterId = masterRes.rows[0].id;
        const res = await pool.query(
            `UPDATE ORDERS 
             SET assigned_to = $1, status = 'in progress', updated_at = NOW() 
             WHERE order_id = $2 
             RETURNING *`,
            [masterId, orderId]
        );
        return res.rows[0];
    },
    getMasterStatus: async () => {
        const res = await pool.query(`
            SELECT 
                u.id, 
                u.email, 
                COUNT(CASE WHEN o.status != 'done' AND o.status != 'canceled' THEN 1 END) as active_orders,
                COUNT(CASE WHEN o.status = 'done' THEN 1 END) as completed_orders,
                COUNT(o.order_id) as total_orders
            FROM USERS u
            LEFT JOIN ORDERS o ON u.id = o.assigned_to
            WHERE u.role = 'master'
            GROUP BY u.id, u.email
        `);
        return res.rows;
    },
    getOrderDetails: async (orderId) => {
        const res = await pool.query(
            `SELECT o.*, u.email as client_email 
            FROM ORDERS o 
            JOIN USERS u ON o.client_id = u.id 
            WHERE o.order_id = $1`, 
            [orderId]
        );
        return res.rows[0];
    },
    getOrderById: async (orderId) => {
        const res = await pool.query(
            `SELECT o.*, u.email as client_email 
             FROM ORDERS o 
             JOIN USERS u ON o.client_id = u.id 
             WHERE o.order_id = $1`, 
            [orderId]
        );
        return res.rows[0];
    },
    // Отримати всі замовлення конкретного клієнта 
    getOrdersByClientId: async(clientId) => {
        const res = await pool.query(
            "SELECT * FROM ORDERS WHERE client_id = $1 ORDER BY created_at DESC",
            [clientId]
        );
        return res.rows;
    },
    // Створити нову заявку
    createNewOrder: async(orderData) => {
    const { client_id, device_type, device_model, os_version, date_of_purchase, issue_description } = orderData;
    const res = await pool.query(
         `INSERT INTO ORDERS 
          (client_id, device_type, device_model, os_version, date_of_purchase, issue_description, status) 
          VALUES ($1, $2, $3, $4, $5, $6, 'new') 
          RETURNING *`,
          [client_id, device_type, device_model, os_version, date_of_purchase, issue_description]
        );
        return res.rows[0];
    },
};

