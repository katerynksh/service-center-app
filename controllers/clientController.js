import pool from "../config/db.js";
import { OrderModel } from "../models/Order.js";

export const getCreateOrderView = (req, res) => {
  res.render("client/createClient", {
    title: "Create New Request",
    user: req.session.user,
    layout: false,
  });
};

class OrderValidator {
  static validateDeviceType(type) {
    if (!type || type.trim().length === 0) return "Device type is required.";
    if (type.length > 50) return "Device type is too long.";
    if (type.length < 4) return "Device type is too short.";
    return null;
  }

  static validateDeviceModel(model) {
    if (!model || model.trim().length === 0) return "Device model is required.";
    if (model.length > 100) return "Device model cannot exceed 100 characters.";
    if (model.length < 4)
      return "Device model cannot be less than 4 characters.";
    return null;
  }

  static validateOsVersion(os) {
    if (!os || os.trim().length === 0) return null;
    if (os.length > 50) return "OS version description is too long.";
    return null;
  }
  static validateDateOfPurchase(dateString) {
    if (!dateString || dateString.trim().length === 0) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date format.";
    const today = new Date();
    if (date > today) return "Purchase date cannot be in the future.";
    return null;
  }

  static validateIssueDescription(issue) {
    if (!issue || issue.trim().length === 0)
      return "Issue description is required.";
    if (issue.length < 10) return "Please describe the issue in more detail.";
    if (issue.length > 1000) return "Issue description is too long.";
    return null;
  }
}

export const createOrderValidation = (req, res, next) => {
  const {
    device_type,
    custom_device_type,
    device_model,
    os_version,
    date_of_purchase,
    issue_description,
  } = req.body;

  let typeToValidate = device_type;
  if (device_type === "Other") {
    typeToValidate = custom_device_type; 
  }

  const validationResults = {
    device_type: OrderValidator.validateDeviceType(typeToValidate),
    device_model: OrderValidator.validateDeviceModel(device_model),
    os_version: OrderValidator.validateOsVersion(os_version),
    date_of_purchase: OrderValidator.validateDateOfPurchase(date_of_purchase),
    issue_description: OrderValidator.validateIssueDescription(issue_description),
  };

  const hasErrors = Object.values(validationResults).some(
    (msg) => msg !== null,
  );
  if (hasErrors) {
    return res.render("client/createClient", {
      title: "Create Order - Service Center",
      errors: validationResults,
      values: {
        device_type,
        custom_device_type,
        device_model,
        os_version,
        date_of_purchase,
        issue_description,
      },
      layout: false,
    });
  }
  if (device_type === "Other") {
    req.body.device_type = custom_device_type;
  }

  next();
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
