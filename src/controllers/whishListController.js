const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

const addToWishList = async (req, res, next) => {
  try {
    const { productId } = req.body;

    // check product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user },
      { $addToSet: { product: productId } },
      { new: true, upsert: true },
    );

    // let wishlist = await Wishlist.findOne({
    //   user: req.user,
    // });
    // if (!wishlist) {
    //   wishlist = await Wishlist.create({
    //     user: req.user,
    //     products: [productId],
    //   });
    //   return res.status(201).json({
    //     success: true,
    //     message: "Product added to wishlist ",
    //     wishlist,
    //   });
    // }
    // // check duplicate
    // const alreadyExists = wishlist.products.some(
    //   (id) => id.toString() === productId,
    // );
    // if (alreadyExists) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Product already in wishlist",
    //   });
    // }
    // // Add product
    // wishlist.products.push(productId);

    // await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      user: req.user,
    }).populate("products", "name price image stock rating numReviews");

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        products: [],
      });
    }

    res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({
      user: req.user,
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    const productExists = wishlist.products.some(
      (id) => id.toString() === productId,
    );

    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Product is not in wishlist",
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId,
    );

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      user: req.user,
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.products = [];

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({
      user: req.user,
      products: productId,
    });

    res.status(200).json({
      success: true,
      isWishlisted: !!wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  clearWishlist,
  removeFromWishlist,
  getWishlist,
  addToWishList,
  checkWishlist,
};
