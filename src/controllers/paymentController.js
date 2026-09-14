const Payment = require("../models/Payment");
const Order = require("../models/Order");
const AppError = require("../utils/AppError");

const createPayment = async (req, res, next) => {
  try {
    const { orderId, method } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new AppError(`Order not found`, 404));
    }
    if (order.user.toString() !== req.user) {
      return next(new AppError(`You are not allowed`, 403));
    }
    if (order.paymentStatus === "paid") {
      return next(new AppError(`ORder is already paid`, 400));
    }

    const payment = await Payment.create({
      order: order._id,
      user: req.user,
      amount: order.totalAmount,
      method,
    });
    res.status(201).json({
      success: true,
      message: "Payment initialized",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createPayment
}