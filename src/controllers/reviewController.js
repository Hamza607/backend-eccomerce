const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");

const hasPurchaseProduct = async (userId, productId) => {
  const order = await Order.findOne({
    user: userId,
    orderStatus: {
      $in: ["proccessing", "shipped", "delivered"],
    },
    "orderItems.product": productId,
  });

  return !!order;
};

const createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;

    // check product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    // check purchase
    const purchased = await hasPurchaseProduct(req.user, productId);

    if (!purchased) {
      return res.status(403).json({
        success: false,
        message: "You can only review products you purchased",
      });
    }
    // create review
    const review = await Review.create({
      user: req.user,
      product: productId,
      rating,
      comment,
    });
    await updateProductRating(productId);
    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateProductRating = async (productId) => {
  const reviews = await Review.find({
    product: productId,
  });

  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0,
    });

    return;
  }

  const totalRating = reviews.reduce(
    (total, review) => total + review.rating,
    0,
  );

  const averageRating = totalRating / reviews.length;

  await Product.findByIdAndUpdate(productId, {
    rating: Number(averageRating.toFixed(1)),
    numReviews: reviews.length,
  });
};

const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Owner check
    if (review.user.toString() !== req.user) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own review",
      });
    }

    review.rating = rating;
    review.comment = comment;

    await review.save();

    await updateProductRating(review.product);

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.user) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own review",
      });
    }

    const productId = review.product;

    await Review.findByIdAndDelete(req.params.id);

    await updateProductRating(productId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createReview,
  getProductReviews,
  updateProductRating,
  updateReview,
  deleteReview,
};
