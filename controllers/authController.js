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

class AuthValidator {
  static validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || email.trim().length === 0) return "Email is required.";
    if (!re.test(email))
      return "Invalid format (for example: service@email.com .)";
    if (email.length > 255) return "Email is too long.";
    if (email.length < 4) return "Email is too short.";
    return null;
  }

  static validateName(name) {
    if (!name || name.trim().length === 0) return "Name is required.";
    if (name.length < 2) return "Name must be at least 2 characters.";
    if (name.length > 50) return "Name is too long.";
    return null;
  }

  static validatePassword(password) {
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (!/[A-Z]/.test(password))
      return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(password))
      return "Password must contain at least one digit.";
    return null;
  }

  static validateConfirmPassword(password, confirmPassword) {
    if (!confirmPassword) return "Please confirm your password.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  }

  static validateLoginEmail(email) {
    if (!email || email.trim().length === 0) return "Email is required.";
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!re.test(email)) return "Please enter a valid email address.";
    return null;
  }

  static validateLoginPassword(password) {
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  }
}

export const registerValidation = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  const validationResults = {
    name: AuthValidator.validateName(name),
    email: AuthValidator.validateEmail(email),
    password: AuthValidator.validatePassword(password),
    confirmPassword: AuthValidator.validateConfirmPassword(
      password,
      confirmPassword,
    ),
  };

  const hasErrors = Object.values(validationResults).some(
    (msg) => msg !== null,
  );

  if (hasErrors) {
    return res.render("auth/register", {
      errors: validationResults,
      layout: false,
      values: { name, email },
    });
  }
  next();
};

export const loginValidation = (req, res, next) => {
  const { email, password } = req.body;
  const validationResults = {
    email: AuthValidator.validateLoginEmail(email),
    password: AuthValidator.validateLoginPassword(password),
  };

  const hasErrors = Object.values(validationResults).some(
    (msg) => msg !== null,
  );

  if (hasErrors) {
    return res.render("auth/login", {
      errors: validationResults,
      layout: false,
      values: { email },
    });
  }

  next();
};

export const register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.render("auth/register", {
      errors: { name: "All fields are required" },
      layout: false,
      values: { name, email },
    });
  }

  if (password !== confirmPassword) {
    return res.render("auth/register", {
      errors: { confirmPassword: "Passwords do not match" },
      layout: false,
      values: { name, email },
    });
  }

  try {
    const userCheck = await UserModel.findUserByEmail(email);
    if (userCheck) {
      return res.render("auth/register", {
        errors: {
          email: "A user with this email address is already registered",
        },
        layout: false,
        values: { name, email },
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
      values: { name, email },
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
        values: { email },
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
        values: { email },
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
