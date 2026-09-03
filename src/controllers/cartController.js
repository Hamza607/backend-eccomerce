const Cart = require("../models/Cart");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");

const addToCart = async (req, res, next) => {
  const productId = req.body.productId;
  const quantity = Number(req.body.quantity) || 1;
  const userId = req.user;
  console.log("req.userreq.user", req.user);

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }
  //check stock
  if (product.stock <= 0) {
    return next(new AppError("Product is out of stock", 400));
  }

  //find user cart
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    if (quantity > product.stock) {
      return next(
        new AppError("Requested quantity is greater than available stock", 400),
      );
    }

    cart = await Cart.create({
      user: userId,
      items: [{ product: productId, quantity }],
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.product.toString() == productId,
    );
    if (existingItem) {
      if (existingItem.quantity + quantity > product.stock) {
        return next(
          new AppError(
            "Requested quantity is greater than available stock",
            400,
          ),
        );
      }
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity });
    }
  }
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Product added to cart successfully",
    data: cart,
  });
};

const getCart = async (req, res, next) => {
  const userId = req.user;
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    select: "name price stock ",
  });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const totalPrice = cart.items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  res.status(200).json({
    success: true,
    data: {
      ...cart.toObject(),
      totalPrice,
    },
  });
};

const updateCartQuantity = async (req, res, next) => {
  const { productId } = req.params;
  const quantity = Number(req.body.quantity);

  if (quantity < 1) {
    return next(new AppError("Quantity must be at least 1", 400));
  }

  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (quantity > product.stock) {
    return next(
      new AppError("Requested quantity is greater than available stock", 400),
    );
  }

  const cart = await Cart.findOne({
    user: req.user,
  });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const cartItem = cart.items.find(
    (item) => item.product.toString() === productId,
  );

  if (!cartItem) {
    return next(new AppError("Product is not in your cart", 404));
  }

  cartItem.quantity = quantity;

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Cart quantity updated",
    data: cart,
  });
};
const removeFromCart = async (req, res, next) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({
    user: req.user,
  });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const itemExists = cart.items.some(
    (item) => item.product.toString() === productId,
  );

  if (!itemExists) {
    return next(new AppError("Product is not in your cart", 404));
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId,
  );

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Product removed from cart",
    data: cart,
  });
};

const clearCart = async (req, res, next) => {
  const cart = await Cart.findOne({
    user: req.user,
  });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  cart.items = [];

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Cart cleared successfully",
  });
};
module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
};
