const express = require("express");
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const auth = require("../middleware/auth");
const checkAdmin = require("../middleware/checkAdmin");
const asynchandler = require("../utils/asyncHandler");
const { categoryValidation } = require("../validations/categoryValidator");
const validate = require("../middleware/validate");

const router = express.Router();

//get all categories

router.get("/", asynchandler(getCategories));

router.get("/:id", asynchandler(getCategoryById));

router.post(
  "/",
  auth,
  checkAdmin,
  categoryValidation,
  validate,
  asynchandler(createCategory),
);

router.put(
  "/:id",
  auth,
  checkAdmin,
  categoryValidation,
  validate,
  asynchandler(updateCategory),
);

router.delete("/:id", auth, checkAdmin, asynchandler(deleteCategory));

module.exports = router;
