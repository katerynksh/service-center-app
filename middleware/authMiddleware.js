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

export default authMiddleware;
