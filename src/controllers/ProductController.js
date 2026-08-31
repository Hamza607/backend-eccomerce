const Product = require("../models/Product");
const AppError = require("../utils/AppError");

const getProduct = async (req, res) => {
  const { search, page = 1, limit = 5, sort, stock } = req.query;

  const query = {};

  //search
  if (search) {
    query.name = {
      $regex: search,
      $options: "i",
    };
  }

  if (stock) {
    query.stock = stock;
  }
  //pagination
  const currentPage = Number(page);
  const productLimit = Number(limit);

  const skip = (currentPage - 1) * productLimit;
  //databse query
  let productQuery = Product.find(query).skip(skip).limit(productLimit);
  //sorting
  if (sort) {
    productQuery = productQuery.sort(sort);
  }

  const products = await productQuery;

  //total products
  const totalProducts = await Product.countDocuments(query);

  res.status(200).json({
    sucess: true,
    pagination: {
      currentPage,
      limit: productLimit,
      totalProducts,
      hasNextPage: currentPage < Math.ceil(totalProducts / productLimit),
      hasPreviousPage: currentPage > 1,
      totalPages: Math.ceil(totalProducts / productLimit),
    },
    data: products,
  });
};

const getProductById = async (req, res) => {
  const products = await Product.findById(req.params.id);

  if (!products) {
    return next(new AppError("Product Not found", 404));
  }
  res.status(200).json({
    success: true,
    data: products,
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
    image:imageUrl,
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
  res.status(200).json({
    success: true,
    message: "Product update successfully ",
    data: product,
  });
};

const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return next(new AppError("Product not foundddd ", 404));
  }
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
