import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || process.env.DB_URL;

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: process.env.DB_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

const initializeDatabase = async () => {
   const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL DEFAULT '',
        password VARCHAR(255) NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('client', 'master', 'admin')) DEFAULT 'client'
    );`;

   const createOrdersTable = `
    CREATE TABLE IF NOT EXISTS orders (
        order_id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES users(id),
        device_type TEXT NOT NULL,
        device_model VARCHAR(100) NOT NULL,
        os_version TEXT,
        date_of_purchase DATE,
        issue_description TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN (
          'new', 
          'in progress', 
          'waiting customer response',
          'waiting spare parts',
          'failed',
          'done'
        )) DEFAULT 'new',
        technician_comment TEXT,
        assigned_to INTEGER REFERENCES users(id),
        cost DECIMAL(10, 2),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );`;

   try {
    await pool.query(createUsersTable);
      await pool.query(createOrdersTable);
      const checkUsers = await pool.query("SELECT COUNT(*) FROM users");
      const checkOrders = await pool.query("SELECT COUNT(*) FROM orders");
      console.log(`✓ USERS table ready (${checkUsers.rows[0].count} records)`);
      console.log(`✓ ORDERS table ready (${checkOrders.rows[0].count} records)`);      
      console.log('✓ Initialized database with USERS and ORDERS tables');
   } catch (error) {
      console.error('✕ Error initializing database:', error);
      throw error;
   }
};

initializeDatabase();

export default pool;