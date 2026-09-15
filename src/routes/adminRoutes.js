const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const checkAdmin = require("../middleware/checkAdmin");

const {
  getDashboardStats,
  getMonthlySales,
  getTopSellingProducts,
} = require("../controllers/adminController");

router.get("/dashboard", auth, checkAdmin, getDashboardStats);

router.get("/sales/monthly", auth, checkAdmin, getMonthlySales);
router.get("/products/top", auth, checkAdmin, getTopSellingProducts);

module.exports = router;
