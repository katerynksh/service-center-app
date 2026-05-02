import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: process.env.DB_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

const initializeDatabase = async () => {
   const createUsersTable = `
    CREATE TABLE IF NOT EXISTS USERS (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('client', 'master', 'admin')) DEFAULT 'client'
    );`;

   const createOrdersTable = `
    CREATE TABLE IF NOT EXISTS ORDERS (
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
      const checkUsers = await pool.query("SELECT COUNT(*) FROM USERS");
      if (parseInt(checkUsers.rows[0].count) === 0) {
        
      await pool.query(`
        INSERT INTO USERS (email, password, role) VALUES 
        ('client@test.com', '123', 'client'),
        ('master@test.com', '123', 'master'),
        ('admin@test.com', '123', 'admin');

        INSERT INTO ORDERS (client_id, device_type, device_model, issue_description, status) VALUES 
        (1, 'Телефон', 'iPhone 13', 'Розбите скло', 'new'),
        (1, 'Ноутбук', 'MacBook Air', 'Залити й водою', 'new');
        
        INSERT INTO ORDERS (client_id, device_type, device_model, issue_description, status, assigned_to) VALUES 
        (1, 'Планшет', 'Samsung Tab', 'Заміна гнізда', 'in progress', 2);
        `);
        console.log('✅ Тестові дані успішно додані');
        }
      
      console.log('✓ Initialized database with USERS and ORDERS tables');
   } catch (error) {
      console.error('✕ Error initializing database:', error);
      throw error;
   }
};

//// тестові дані для зручності розробки
// try {
//     await pool.query(`
//         INSERT INTO USERS (email, password, role) 
//         VALUES ('test@master.com', '123', 'master') 
//         ON CONFLICT (email) DO NOTHING;
        
//         INSERT INTO ORDERS (client_id, device_type, device_model, issue_description, status) 
//         VALUES (1, 'Test Device', 'Test Model', 'Test Issue', 'new');
//     `);
//     console.log("✅ Тестові дані додано");
// } catch (e) {
//     console.log("Тестові дані вже існують або помилка клієнта");
// }

initializeDatabase();

export default pool;