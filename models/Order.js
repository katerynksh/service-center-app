import pool from "../config/db.js";

export const OrderModel = {
  // Для Майстра: бачити нові та свої
  getNewOrders: async () => {
    const res = await pool.query(`
        SELECT o.*, u.email as client_email 
        FROM ORDERS o 
        JOIN USERS u ON o.client_id = u.id 
        WHERE o.status = 'new'
        ORDER BY o.created_at DESC
    `);
    return res.rows;
  },
  getOrdersByMaster: async (masterId) => {
    const res = await pool.query(
      `
        SELECT o.*, u.email as client_email 
        FROM orders o 
        JOIN users u ON o.client_id = u.id 
        WHERE o.assigned_to = $1
        ORDER BY o.created_at DESC
    `,
      [masterId],
    );
    return res.rows;
  },

  // Оновлення статусу майстром
  updateStatus: async (id, status, comment, cost) => {
      const res = await pool.query(
      "UPDATE orders SET status = $1, technician_comment = $2, cost = $3, updated_at = NOW() WHERE order_id = $4 RETURNING *",
      [status, comment, cost || 0, id], // Записуємо ціну
    );
    return res.rows[0];
  },
  takeOrder: async (orderId, masterId) => {
    const res = await pool.query(
      "UPDATE orders SET assigned_to = $1, status = 'in progress', updated_at = NOW() WHERE order_id = $2 RETURNING *",
      [masterId, orderId],
    );
    return res.rows[0];
  },
  // Для Адміна: всі замовлення та всі майстри
  getAllOrders: async () => {
    const res = await pool.query(`
          SELECT 
            o.*, 
            m.email as master_email,
            c.email as client_email,
            c.name as client_name
          FROM orders o 
        LEFT JOIN users m ON o.assigned_to = m.id 
        LEFT JOIN users c ON o.client_id = c.id
        ORDER BY o.created_at DESC
        `);
    return res.rows;
  },
  updateFullOrder: async (id, data) => {
    const {
      device_type,
      device_model,
      os_version,
      issue_description,
      status,
      cost,
      assigned_to,
    } = data;
    const res = await pool.query(
      `UPDATE orders SET 
                device_type = $1, device_model = $2, os_version = $3, 
                issue_description = $4, status = $5, cost = $6, 
                assigned_to = $7, updated_at = NOW() 
             WHERE order_id = $8 RETURNING *`,
      [
        device_type,
        device_model,
        os_version,
        issue_description,
        status,
        cost,
        assigned_to,
        id,
      ],
    );
    return res.rows[0];
  },
  deleteOrder: async (id) => {
    await pool.query("DELETE FROM orders WHERE order_id = $1", [id]);
    return { success: true };
  },
  getAllMasters: async () => {
    const res = await pool.query(
      "SELECT id, email FROM users WHERE role = 'master'",
    );
    return res.rows;
  },
  assignToMaster: async (orderId, masterId) => {
    const res = await pool.query(
      `UPDATE orders 
             SET assigned_to = $1, status = 'in progress', updated_at = NOW() 
             WHERE order_id = $2 RETURNING *`,
      [masterId, orderId],
    );
    return res.rows[0];
  },
  assignMasterByEmail: async (orderId, masterEmail) => {
    const masterRes = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND role = 'master'",
      [masterEmail],
    );

    if (masterRes.rows.length === 0) {
      throw new Error(
        "Master with this email not found or user is not a master",
      );
    }

    const masterId = masterRes.rows[0].id;
    const res = await pool.query(
      `UPDATE orders 
             SET assigned_to = $1, status = 'in progress', updated_at = NOW() 
             WHERE order_id = $2 
             RETURNING *`,
      [masterId, orderId],
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
            FROM users u
            LEFT JOIN orders o ON u.id = o.assigned_to
            WHERE u.role = 'master'
            GROUP BY u.id, u.email
        `);
    return res.rows;
  },
  getOrderDetails: async (orderId) => {
    const res = await pool.query(
      `SELECT o.*, u.email as client_email 
            FROM orders o 
            JOIN users u ON o.client_id = u.id 
            WHERE o.order_id = $1`,
      [orderId],
    );
    return res.rows[0];
  },
  getOrderById: async (orderId) => {
    const res = await pool.query(
      `SELECT o.*, u.email as client_email 
             FROM orders o 
             JOIN users u ON o.client_id = u.id 
             WHERE o.order_id = $1`,
      [orderId],
    );
    return res.rows[0];
  },

 getOrdersByClientId: async (clientId) => {
    const query = `
        SELECT 
            o.*, 
            m.name AS master_name 
        FROM orders o
        LEFT JOIN users m ON o.assigned_to = m.id
        WHERE o.client_id = $1
        ORDER BY o.created_at DESC
    `;
    
    try {
        const { rows } = await pool.query(query, [clientId]);
        return rows;
    } catch (err) {
        console.error("SQL Error in getOrdersByClientId:", err);
        throw err;
    }
  },

  // Створити нову заявку
  createNewOrder: async (orderData) => {
    const {
      client_id,
      device_type,
      device_model,
      os_version,
      date_of_purchase,
      issue_description,
    } = orderData;
    const res = await pool.query(
      `INSERT INTO orders 
          (client_id, device_type, device_model, os_version, date_of_purchase, issue_description, status) 
          VALUES ($1, $2, $3, $4, $5, $6, 'new') 
          RETURNING *`,
      [
        client_id,
        device_type,
        device_model,
        os_version,
        date_of_purchase,
        issue_description,
      ],
    );
    return res.rows[0];
  },
  cancelOrderByClient: async (orderId, clientId) => {
    try {
      const res = await pool.query(
        "UPDATE orders SET status = 'canceled', updated_at = NOW() WHERE order_id = $1 AND client_id = $2 AND status = 'new' RETURNING *",
        [orderId, clientId],
      );
      if (res.rows.length === 0) {
        throw new Error("Order not found or cannot be canceled");
      }
      return res.rows[0];
    } catch (err) {
      console.error("Order cancellation error:", err.message);
      throw err;
    }
  },
};

export default OrderModel;
