const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  cancelOrder,
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
router.get("/my-orders", asyncHandler(getMyOrders));
router.get("/all-orders", asyncHandler(getAllOrders));
router.get("/:id", checkAdmin, asyncHandler(getOrderById));
router.put("/:id/cancel", auth, asyncHandler(cancelOrder));
router.put(
  "/:id/status",
  checkAdmin,
  updateOrderStatusValidator,
  validate,
  asyncHandler(updateOrderStatus),
);

module.exports = router;
