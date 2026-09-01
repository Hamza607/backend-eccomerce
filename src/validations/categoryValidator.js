const { body } = require("express-validator");

const categoryValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2 })
    .withMessage(
      "Category name must be at least 2 characters"
    ),
];

module.exports = {
  categoryValidation,
};