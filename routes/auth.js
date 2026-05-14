import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// Сторінки (GET)
router.get("/login", authController.getLoginView);
router.get("/register", authController.getRegisterView);
router.get("/logout", authController.logout);

// Дії (POST)
router.post("/register", authController.registerValidation, authController.register);
router.post("/login", authController.loginValidation, authController.login);

export default router;
