import pool from "../config/db.js";
import { User } from "./index.js";

export const findUserByEmail = async (email) => {
  try {
    const query = "SELECT * FROM users WHERE email = $1";
    const res = await pool.query(query, [email]);
    return res.rows[0];
  } catch (err) {
    console.error("Database error in findUserByEmail:", err.message);
    throw err;
  }
};

export const createUser = async ({ email, name, password, role }) => {
  try {
    const res = await pool.query(
        `INSERT INTO users (email, name, password, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [email, name, password, role || 'client']
    );
    return res.rows[0];
  } catch (err) {
    console.error("Database error in createUser:", err.message);
    throw err;
  }
};


export const findUserById = async (id) => {
  const query = "SELECT id, email, name, role FROM users WHERE id = $1";
  const res = await pool.query(query, [id]);
  return res.rows[0];
};

export const getAllUsers = async () => {
  const res = await pool.query(
    "SELECT id, email, name, role FROM users ORDER BY id ASC",
  );
  return res.rows;
};

export const UserModel = {
    create: async ({ email, name, password, role }) => {
        const res = await pool.query(
            'INSERT INTO users (email, name, password, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
            [email, name, password, role]
        );
        return res.rows[0];
    }
};

export default {
  findUserByEmail,
  createUser,
  findUserById,
  getAllUsers,
  UserModel,
};
