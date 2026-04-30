import UserModel from "../models/User.js";

export const setUser = async (req, res, next) => {
    const userId = req.query.clientId || req.body.client_id;
    
    if (userId) {
        try {
            const user = await UserModel.findUserById(userId);
            if (user) {
                req.user = user; 
            }
        } catch (err) {
            console.error("Error setting user:", err);
        }
    }
    next();
};

export const isClient = (req, res, next) => {
  if (req.user && req.user.role === "client") {
    return next();
  }
  return res
    .status(403)
    .render("error", { message: "Access denied: You are not a customer" });
};

export const isMaster = (req, res, next) => {
  if (req.user && req.user.role === "master" ) {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Access denied: you are not a master" });
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Access denied: you are not an admin" });
};

const authMiddleware = (req, res, next) => {
  if (!req.user)
    return res
      .status(401)
      .json({ message: "Access denied: you are not authenticated" });
  next();
};

export default authMiddleware;