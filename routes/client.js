import express from "express";

import {
  getMyOrders,
  createOrder,
  getCreateOrderView,
  createOrderValidation,
  getArchiveOrders,
} from "../controllers/clientController.js";

import { setUser, isClient } from "../middleware/authMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(setUser);
router.use(authMiddleware);

router.get("/dashboard", isClient, getMyOrders);

router.get("/archive", isClient, getArchiveOrders);

router.get("/create", isClient, getCreateOrderView);

router.post("/create", isClient, createOrderValidation, createOrder);

export default router;
