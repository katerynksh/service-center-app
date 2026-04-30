import pool from "../config/db.js";
import OrderModel from "../models/orderModel.js";

// ПЕРЕГЛЯД СВОЇХ ЗАМОВЛЕНЬ
export const getMyOrders = async (req, res) => {
  const clientId = req.query.clientId;
  try {
    const orders = await OrderModel.getOrdersByClientId(clientId);

    res.render("client/my-orders", {
      orders: orders,
      clientId: clientId,
      title: "My Application History",
    });
  } catch (err) {
    console.error("Error loading history:", err);
    res.status(500).send("Error loading history");
  }
};

// СТВОРЕННЯ ЗАМОВЛЕННЯ (POST)
export const createOrder = async (req, res) => {
  const {
    client_id,
    device_type,
    device_model,
    os_version,
    date_of_purchase,
    issue_description,
  } = req.body;

  try {
    await OrderModel.createNewOrder({
      client_id,
      device_type,
      device_model,
      os_version,
      date_of_purchase,
      issue_description,
    });

    res.redirect(`/client/orders?clientId=${client_id}`);
  } catch (err) {
    console.error("Failed to create request:", err);
    res.status(500).send("Failed to create request");
  }
};