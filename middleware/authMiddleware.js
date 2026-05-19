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
  if (!req.user) {
    return res.redirect("/auth/login?error=expired");
  }
  if (req.user.role === "client") {
    return next();
  }
  res.status(403).render("error", { message: "Access denied: This section is only for Clients." });
};

export const isMaster = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/auth/login?error=expired");
  }
  if (req.user.role === "master") {
    return next();
  }
  res.status(403).render("error", { message: "Access denied: This section is only for Masters." });
};

export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/auth/login?error=expired");
  }
  if (req.user.role === "admin") {
    return next();
  }
  res.status(403).render("error", { message: "Access denied: This section is only for Admins." });
};

const authMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/auth/login");
  }
  next();
};

// Перевіряє, чи користувач авторизований
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/auth/login?error=expired");
  }
  next(); 
};

// Перевіряє, чи має користувач потрібну роль
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      const err = new Error(`Доступ заборонено: ця сторінка доступна лише для ${role}.`);
      err.status = 403; 
      return next(err); 
    }
    next();
  };
};

export default authMiddleware;
