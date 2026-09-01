const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const Category = require("../models/Category");

const createCategory = async (req, res, next) => {
  const { name } = req.body;

  const existingCategory = await Category.findOne({
    name: {
      $regex: `^${name}$`,
      $options: "i",
    },
  });

  if (existingCategory) {
    return next(new AppError("Category already exists", 400));
  }

  const category = await Category.create({
    name,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
};

const getCategories = async (req, res) => {
  const categories = await Category.find().sort("-createdAt");

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
};

const getCategoryById = async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    success: true,
    data: category,
  });
};

const updateCategory = async (req, res, next) => {
  const { name } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  if (name !== undefined) {
    category.name = name;
  }

  await category.save();

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
};

const deleteCategory = async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  const productsCount = await Product.countDocuments({
    category: category._id,
  });

  if (productsCount > 0) {
    return next(
      new AppError(
        "Cannot delete category because products are associated with it",
        400,
      ),
    );
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
