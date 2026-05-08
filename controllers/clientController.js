import pool from "../config/db.js";
import { OrderModel } from "../models/Order.js";

export const getCreateOrderView = (req, res) => {
  res.render("client/createClient", {
    title: "Create New Request",
    user: req.session.user,
    layout: false,
  });
};

export const getMyOrders = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/auth/login");
    }
    const clientId = req.session.user.id;
    const orders = await OrderModel.getOrdersByClientId(clientId);

    res.render("client/dashboardClient", {
      orders: orders,
      user: req.session.user,
      title: "My Repair Orders",
      layout: false,
    });
  } catch (err) {
    console.error("Error loading history:", err);
    res.status(500).send("Error loading history");
  }
};

export const createOrder = async (req, res) => {
  const {
    device_type,
    device_model,
    os_version,
    date_of_purchase,
    issue_description,
  } = req.body;

  if (!req.session.user) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const client_id = req.session.user.id;

    await OrderModel.createNewOrder({
      client_id,
      device_type,
      device_model,
      os_version,
      date_of_purchase,
      issue_description,
    });

    res.redirect(`/client/dashboard`);
  } catch (err) {
    console.error("Failed to create request:", err);
    res.render("client/createClient", {
      error: "Failed to create request",
      layout: false,
      user: req.session.user,
    });
  }
};
