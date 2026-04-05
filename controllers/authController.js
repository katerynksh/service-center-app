//логін та реєстрація користувача
import e from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcrypt';

//РЕЄСТРАЦІЯ (Створення нового клієнта)
export const register = async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    if (!email || !password || !confirmPassword) {
        return res.status(400).send("All fields are required");
    }
    if (password !== confirmPassword) {
        return res.status(400).send("Passwords do not match");
    }
    try {
        const userCheck = await pool.query('SELECT * FROM USERS WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).send("A user with this email address is already registered");
        }
        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(password, saltRound);
        await pool.query(
            'INSERT INTO USERS (email, password, role) VALUES ($1, $2, $3)',
            [email, hashedPassword, 'client']
        );
        res.redirect('/auth/login');
    } catch (err){
        console.error("Registration error:", err);
        res.status(500).send("Server error during registration");
    }
};

// ВХІД (Логін)
export const login = async(req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM USERS WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).send("User not found");
        }
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch || password === user.password) {
            if (user.role === 'client') {
                return res.redirect(`/client/orders?clientId=${user.id}`);
            } else if (user.role === 'master') {
                return res.redirect(`/master/dashboard?masterId=${user.id}`);
            } else if (user.role === 'admin') {
                return res.redirect(`/admin/panel`);
            }
        } else {
            return res.status(401).send("Incorrect password");
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send("Server error");
    }
};

// ВИХІД
export const logout = (req, res) => {
    res.redirect('/auth/login');
};