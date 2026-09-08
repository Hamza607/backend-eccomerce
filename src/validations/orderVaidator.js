const { body, param } = require("express-validator");

const createOrderValidator = [
  body("shippingAddress.fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),

  body("shippingAddress.address")
    .trim()
    .notEmpty()
    .withMessage("Address is required"),

  body("shippingAddress.city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),
];

const updateOrderStatusValidator = [
  param("id").isMongoId().withMessage("Invalid order ID"),
  body("status")
    .isIn(["pending", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid order status"),
];

module.exports = {
  createOrderValidator,
  updateOrderStatusValidator,
};
