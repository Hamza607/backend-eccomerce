const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} = require("../controllers/orderController");
const auth = require("../middleware/auth");
const {
  createOrderValidator,
  updateOrderStatusValidator,
} = require("../validations/orderVaidator");
const asyncHandler = require("../utils/asyncHandler");
const checkAdmin = require("../middleware/checkAdmin");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(auth);

router.post("/", createOrderValidator, validate, asyncHandler(createOrder));
router.get("/my-orders", getMyOrders);
router.get("/all-orders", getAllOrders);
router.get("/:id", checkAdmin, getOrderById);
router.put(
  "/:id/status",
  checkAdmin,
  updateOrderStatusValidator,
  validate,
  asyncHandler(updateOrderStatus),
);

module.exports = router;
