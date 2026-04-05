import pool from '../config/db.js';

export const findUserByEmail = async (email) => {
    const query = 'SELECT * FROM USERS WHERE email = $1';
    const res = await pool.query(query, [email]);
    return res.rows[0]; // Повертає об'єкт юзера або undefined
};

export const createUser = async (email, hashedPassword, role = 'client') => {
    const query = `
        INSERT INTO USERS (email, password, role) 
        VALUES ($1, $2, $3) 
        RETURNING id, email, role
    `;
    const res = await pool.query(query, [email, hashedPassword, role]);
    return res.rows[0];
};

export const findUserById = async (id) => {
    const query = 'SELECT id, email, role FROM USERS WHERE id = $1';
    const res = await pool.query(query, [id]);
    return res.rows[0];
};

export const getAllUsers = async () => {
    const res = await pool.query('SELECT id, email, role FROM USERS ORDER BY id ASC');
    return res.rows;
};