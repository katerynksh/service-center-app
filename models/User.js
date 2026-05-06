import pool from "../config/db.js";

export const findUserByEmail = async (email) => {
  try {
    const query = "SELECT * FROM USERS WHERE email = $1";
    const res = await pool.query(query, [email]);
    return res.rows[0];
  } catch (err) {
    console.error("Database error in findUserByEmail:", err.message);
    throw err;
  }
};

export const createUser = async (email, hashedPassword, role = "client") => {
  try {
    const query = `
        INSERT INTO USERS (email, password, role) 
        VALUES ($1, $2, $3) 
        RETURNING id, email, role
    `;
    const res = await pool.query(query, [email, hashedPassword, role]);
    return res.rows[0];
  } catch (err) {
    console.error("Database error in createUser:", err.message);
    throw err;
  }
};

export const findUserById = async (id) => {
  const query = "SELECT id, email, role FROM USERS WHERE id = $1";
  const res = await pool.query(query, [id]);
  return res.rows[0];
};

export const getAllUsers = async () => {
  const res = await pool.query(
    "SELECT id, email, role FROM USERS ORDER BY id ASC",
  );
  return res.rows;
};

export default {
  findUserByEmail,
  createUser,
  findUserById,
  getAllUsers,
};