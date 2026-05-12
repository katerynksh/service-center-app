import UserModel from "../models/User.js";

export const setUser = async (req, res, next) => {
  const userId = req.session?.user?.id;

  if (!userId) {
    return next();
  }

  try {
    const user = await UserModel.findUserById(userId);
    if (user) {
      req.user = user;
    }
    next();
  } catch (err) {
    console.error("Error setting user:", err);
    next();
  }
};

export const isClient = (req, res, next) => {
  if (req.user && req.user.role === "client") {
    return next();
  }
  res.status(403).render("error", {
    message: "Access denied: You need a Client account to view this page.",
  });
};

export const isMaster = (req, res, next) => {
  if (req.user && req.user.role === "master") {
    return next();
  }
  res.status(403).render("error", {
    message: "Access denied: This area is for Masters only.",
  });
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).render("error", {
    message: "Access denied: Administrator privileges required.",
  });
};

const authMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/auth/login");
  }
  next();
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

export const registrationMiddleware = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  const validationResults = {
    name: AuthValidator.validateName(name),
    email: AuthValidator.validateEmail(email),
    password: AuthValidator.validatePassword(password),
    confirmPassword: AuthValidator.validateConfirmPassword(
      password,
      confirmPassword
    ),
  };

  const hasErrors = Object.values(validationResults).some((msg) => msg !== null);

  if (hasErrors) {
    return res.render("auth/register", {
      errors: validationResults,
      layout: false,
      values: { name, email },
    });
  }
  next();
};

export const loginMiddleware = (req, res, next) => {
  const { email, password } = req.body;
  const validationResults = {
    email: AuthValidator.validateLoginEmail(email),
    password: AuthValidator.validateLoginPassword(password)
  };

  const hasErrors = Object.values(validationResults).some((msg) => msg !== null);

  if (hasErrors) {
    return res.render("auth/login", {
      errors: validationResults, 
      layout: false,
      values: { email }
    });
  }

  next();
};

export default authMiddleware;
