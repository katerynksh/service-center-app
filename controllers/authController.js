//логін та реєстрація користувача
import pool from "../config/db.js";
import bcrypt from "bcrypt";
import UserModel from "../models/User.js";

export const getLoginView = (req, res) => {
    res.render('auth/login', { title: 'Login - Service Center' });
};

export const getRegisterView = (req, res) => {
    res.render('auth/register', { title: 'Sign Up - Service Center' });
};

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
    const userCheck = await UserModel.findUserByEmail(email);
    if (userCheck) {
      return res
        .status(400)
        .send("A user with this email address is already registered");
    }

    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);

    await UserModel.createUser(email, hashedPassword, "client");

    res.redirect("/auth/login");
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).send("Server error during registration");
  }
};

// ВХІД (Логін)
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findUserByEmail(email);

    if (!user) {
      return res.status(401).send("Користувача не знайдено");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {

      if (user.role === "client") {
        return res.redirect(`/client/orders?clientId=${user.id}`);
      } else if (user.role === "master") {
        return res.redirect(`/master/dashboard?masterId=${user.id}`);
      } else if (user.role === "admin") {
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
  res.redirect("/auth/login");
};
