const { body, param } = require("express-validator");

const addToCartValidation = [
  body("productId").notEmpty().withMessage("Product ID is required"),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
];

const updateCartQuantityValidation = [
  param("productId").notEmpty().withMessage("Product ID is required"),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
];

const removeFromCartValidation = [
  param("productId").notEmpty().withMessage("Product ID is required"),
];

module.exports = {
  addToCartValidation,
  updateCartQuantityValidation,
  removeFromCartValidation,
};
