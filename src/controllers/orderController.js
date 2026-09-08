const Order = require("../models/Order");
const AppError = require("../utils/AppError");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

const createOrder = async (req, res, next) => {
  const { shippingAddress } = req.body;

  const cart = await Cart.findOne({ user: req.user }).populate({
    path: "items.product",
    select: "name price stock",
  });

  if (!cart || cart.items.length === 0) {
    return next(new AppError("Your cart is empty", 400));
  }

  const orderItems = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const product = item.product;
    if (!product) {
      return next(new AppError("One of the products no longer exists", 404));
    }
    if (product.stock < item.quantity) {
      return next(
        new AppError(`${product.name} does not have enough stock`, 400),
      );
    }
    orderItems.push({
      product: product._id,
      name : product.name,
      quantity: item.quantity,
      price: product.price,
    });
    totalAmount += product.price * item.quantity;
  }

  const order = await Order.create({
    user: req.user,
    orderItems,
    totalAmount,
    shippingAddress,
  });

  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity },
    });
  }
  cart.items = [];
  await cart.save();

  res.status(201).json({
    status: "success",
    message: "Order placed successfully",
    data: order,
  });
};

const getMyOrders = async (req, res, next) => {
  const orders = await Order.find({ user: req.user }).sort({
    createdAt: -1,
  });
  res.status(200).json({
    status: "success",
    count: orders.length,
    data: orders,
  });
};

const getOrderById = async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email",
  );
  if (!order) {
    return next(new AppError("Order not found", 404));
  }
  const isOwner = order.user._id.toString() === req.user;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return next(new AppError("You are not authorized to view this order", 403));
  }

  res.status(200).json({
    status: "success",
    data: order,
  });
};

const updateOrderStatus = async (req, res, next) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  order.orderStatus = status;
  await order.save();

  res.status(200).json({
    status: "success",
    message: "Order status updated successfully",
    data: order,
  });
};

const getAllOrders = async (req, res, next) => {
  const orders = await Order.find().populate("user", "name email").sort({
    createdAt: -1,
  });
  res.status(200).json({
    status: "success",
    count: orders.length,
    data: orders,
  });
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
};
