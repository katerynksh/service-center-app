import pool from "../config/db.js";
import bcrypt from "bcrypt";
import UserModel from "../models/User.js";

export const getLoginView = (req, res) => {
  res.render("auth/login", {
    title: "Login - Service Center",
    layout: false,
  });
};

export const getRegisterView = (req, res) => {
  res.render("auth/register", {
    title: "Sign Up - Service Center",
    layout: false,
  });
};

export const register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.render("auth/register", {
      errors: { name: "All fields are required" }, 
      layout: false,
      values: { name, email }
    });
  }

  if (password !== confirmPassword) {
    return res.render("auth/register", {
      errors: { confirmPassword: "Passwords do not match" }, 
      layout: false,
      values: { name, email }
    });
  }

  try {
    const userCheck = await UserModel.findUserByEmail(email);
    if (userCheck) {
      return res.render("auth/register", {
        errors: { email: "A user with this email address is already registered" }, 
        layout: false,
        values: { name, email }
      });
    }

    await UserModel.createUser({
      name,
      email,
      password,
      role: "client",
    });

    res.redirect("/auth/login");
  } catch (err) {
    console.error("Registration error:", err);
    res.render("auth/register", {
      error: "Server error during registration", 
      layout: false,
      values: { name, email }
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findUserByEmail(email);

    if (!user) {
      return res.render("auth/login", {
        title: "Login",
        errors: { email: "User not found" },
        layout: false,
        values: { email }
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      if (user.role === "client") {
        return res.redirect(`/client/dashboard`);
      } else if (user.role === "master") {
        return res.redirect(`/master`);
      } else if (user.role === "admin") {
        return res.redirect(`/admin`);
      }
    } else {
      return res.render("auth/login", {
        title: "Login",
        errors: { password: "Incorrect password" },
        layout: false,
        values: { email }
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.render("auth/login", {
      error: "Server error",
      layout: false,
    });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/");
    }
    res.clearCookie("sid");
    res.redirect("/auth/login");
  });
};
