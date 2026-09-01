const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const fs = require("fs");
const path = require("path");

const getProduct = async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    inStock,
    page = 1,
    limit = 10,
    sort = "-createdAt",
  } = req.query;

  const query = {};

  //search
  if (search) {
    query.name = {
      $regex: search,
      $options: "i",
    };
  }

  
  if (minPrice || maxPrice) {
    query.price = {};

    if (minPrice) {
      query.price.$gte = Number(minPrice);
    }

    if (maxPrice) {
      query.price.$lte = Number(maxPrice);
    }
  }
  if (inStock === "true") {
    query.stock = { $gt: 0 };
  }
  
  if (category) {
    query.category = category;
  }
  //pagination
  const currentPage = Number(page);
  const productLimit = Number(limit);

  const skip = (currentPage - 1) * productLimit;
  //databse query
  let products = await Product.find(query)
    .populate("category", "name")
    .sort(sort)
    .skip(skip)
    .limit(productLimit);

  //total products
  const totalProducts = await Product.countDocuments(query);

  // Image URL add karna
  const productsWithUrl = products.map((product) => ({
    ...product.toObject(),

    image: product.image
      ? `${req.protocol}://${req.get("host")}/uploads/${product.image}`
      : null,
  }));

  res.status(200).json({
    success: true,
    data: productsWithUrl,
    pagination: {
      total: totalProducts,
      page: currentPage,
      limit: productLimit,
      totalPages: Math.ceil(totalProducts / productLimit),
    },
  });
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name",
  );

  if (!product) {
    return next(new AppError("Product Not found", 404));
  }
  const productWithUrl = {
    ...product.toObject(),

    image: product.image
      ? `${req.protocol}://${req.get("host")}/uploads/${product.image}`
      : null,
  };
  res.status(200).json({
    success: true,
    data: productWithUrl,
  });
};

const createProduct = async (req, res, next) => {
  const { name, price, description, category, stock } = req.body;

  const imageUrl = req.file
    ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    : null;

  const products = await Product.create({
    name,
    price,
    description,
    category,
    stock,
    image: imageUrl,
  });

  res.status(201).json({
    success: true,
    message: "Product created Successfully",
    data: products,
  });
};

const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError("Product not foundddd ", 404));
  }
  const { name, price, description, category, stock } = req.body;

  if (name !== undefined) {
    product.name = name;
  }
  if (price !== undefined) {
    product.price = price;
  }

  if (description !== undefined) {
    product.description = description;
  }

  if (category !== undefined) {
    product.category = category;
  }

  if (stock !== undefined) {
    product.stock = stock;
  }

  //new image upload
  if (req.file) {
    //delete old image if exists
    if (product.image) {
      const oldImagePath = path.join(process.cwd(), "uploads", product.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    product.image = req.file.filename;
  }

  await product.save();

  res.status(200).json({
    success: true,
    message: "Product update successfully ",
    data: product,
  });
};

const deleteProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not foundddd ", 404));
  }

  if (product.image) {
    const imagePath = path.join(process.cwd(), "uploads", product.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Product delete Successfully",
  });
};

module.exports = {
  getProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
