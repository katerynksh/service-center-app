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
      error: "All fields are required",
      layout: false,
    });
  }

  if (password !== confirmPassword) {
    return res.render("auth/register", {
      error: "Passwords do not match",
      layout: false,
    });
  }

  try {
    const userCheck = await UserModel.findUserByEmail(email);
    if (userCheck) {
      return res.render("auth/register", {
        error: "A user with this email address is already registered",
        layout: false,
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
        error: "User not found",
        layout: false,
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
        error: "Incorrect password",
        layout: false,
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
