const { body } = require("express-validator");

const productValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),

  body("stock")
    .notEmpty()
    .withMessage("Stock is required")
    .isInt({ min: 0 })
    .withMessage("Stock must be a positive integer"),
];

module.exports = {
  productValidation,
};