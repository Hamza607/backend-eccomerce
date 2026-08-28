const express = require("express");
const auth = require("../middleware/auth");
const checkAdmin = require("../middleware/checkAdmin");
const router = express.Router();

const {
  getProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/ProductController");
const asynchandler = require("../utils/asyncHandler");

//get all products
router.get("/", asynchandler(getProduct));

router.get("/:id", asynchandler(getProductById));

router.post("/", auth, checkAdmin, asynchandler(createProduct));

router.put("/:id", auth, checkAdmin, asynchandler(updateProduct));

router.delete("/:id", auth, checkAdmin, asynchandler(deleteProduct));

module.exports = router;
