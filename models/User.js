import pool from "../config/db.js";
import { User } from "./index.js";
import bcrypt from "bcrypt";

class UserModel {
  static async createUser({email, password, name = null, role}) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const query = `
        INSERT INTO users (email, name, password, role) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, email, name, role
      `;
      const values = [email, name || '', hashedPassword, role || 'client'];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (err) {
      console.error("Error creating user:", err.message);
      throw err;
    }
  }

  static async findUserByEmail(email) {
    try {
      const query = "SELECT * FROM users WHERE email = $1";
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (err) {
      console.error("Error finding user by email:", err.message);
      throw err;
    }
  }

  static async findUserById(id) {
        try {
            const query = 'SELECT * FROM users WHERE id = $1';
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error("Error in findUserById:", error);
            throw error;
        }
    }

  static async getAllUsers() {
    try {
      const res = await pool.query(
        "SELECT id, email, name, role FROM users ORDER BY id ASC",
      );
      return res.rows;
    } catch (err) {
      console.error("Error fetching all users:", err.message);
      throw err;
    }
  }
}




// export const createUser = async ({ email, name, password, role }) => {
//   try {
//     const res = await pool.query(
//         `INSERT INTO users (email, name, password, role) 
//          VALUES ($1, $2, $3, $4) 
//          RETURNING *`,
//         [email, name, password, role || 'client']
//     );
//     return res.rows[0];
//   } catch (err) {
//     console.error("Database error in createUser:", err.message);
//     throw err;
//   }
// };


// export const findUserById = async (id) => {
//   const query = "SELECT id, email, name, role FROM users WHERE id = $1";
//   const res = await pool.query(query, [id]);
//   return res.rows[0];
// };

// export const getAllUsers = async () => {
//   const res = await pool.query(
//     "SELECT id, email, name, role FROM users ORDER BY id ASC",
//   );
//   return res.rows;
// };

// export const UserModel = {
//     create: async ({ email, name, password, role }) => {
//         const res = await pool.query(
//             'INSERT INTO users (email, name, password, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
//             [email, name, password, role]
//         );
//         return res.rows[0];
//     }
// };

export { UserModel };
export default UserModel;
