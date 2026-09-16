const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const fs = require("fs");
const path = require("path");

// const getProduct = async (req, res) => {
//   const {
//     search,
//     category,
//     minPrice,
//     maxPrice,
//     inStock,
//     page = 1,
//     limit = 10,
//     sort = "-createdAt",
//   } = req.query;

//   const query = {};

//   //search
//   if (search) {
//     query.name = {
//       $regex: search,
//       $options: "i",
//     };
//   }

//   if (minPrice || maxPrice) {
//     query.price = {};

//     if (minPrice) {
//       query.price.$gte = Number(minPrice);
//     }

//     if (maxPrice) {
//       query.price.$lte = Number(maxPrice);
//     }
//   }
//   if (inStock === "true") {
//     query.stock = { $gt: 0 };
//   }

//   if (category) {
//     query.category = category;
//   }
//   //pagination
//   const currentPage = Number(page);
//   const productLimit = Number(limit);

//   const skip = (currentPage - 1) * productLimit;
//   //databse query
//   let products = await Product.find(query)
//     .populate("category", "name")
//     .sort(sort)
//     .skip(skip)
//     .limit(productLimit);

//   //total products
//   const totalProducts = await Product.countDocuments(query);

//   // Image URL add karna
//   const productsWithUrl = products.map((product) => ({
//     ...product.toObject(),

//     image: product.image
//       ? `${req.protocol}://${req.get("host")}/uploads/${product.image}`
//       : null,
//   }));

//   res.status(200).json({
//     success: true,
//     data: productsWithUrl,
//     pagination: {
//       total: totalProducts,
//       page: currentPage,
//       limit: productLimit,
//       totalPages: Math.ceil(totalProducts / productLimit),
//     },
//   });
// };

const getProduct = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, minRating, inStock, sort } =
      req.query;

    const allowedSorts = [
      "price_asc",
      "price_desc",
      "rating",
      "name_asc",
      "name_desc",
      "newest",
      "oldest",
    ];

    if (sort && !allowedSorts.includes(sort)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sort option",
      });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

    const skip = (page - 1) * limit;

    // Base filter
    const filter = {};

    // Search
    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }
    // Category
    if (category) {
      filter.category = category;
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Rating filter
    if (minRating) {
      filter.rating = {
        $gte: Number(minRating),
      };
    }

    // Stock filter
    if (inStock === "true") {
      filter.stock = {
        $gt: 0,
      };
    }

    if (inStock === "false") {
      filter.stock = 0;
    }

    // Sorting
    let sortOption = {
      createdAt: -1,
    };

    if (sort === "price_asc") {
      sortOption = {
        price: 1,
      };
    }

    if (sort === "price_desc") {
      sortOption = {
        price: -1,
      };
    }

    if (sort === "rating") {
      sortOption = {
        rating: -1,
      };
    }

    if (sort === "newest") {
      sortOption = {
        createdAt: -1,
      };
    }

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1,
      };
    }

    if (minPrice && isNaN(Number(minPrice))) {
      return res.status(400).json({
        success: false,
        message: "minPrice must be a valid number",
      });
    }

    if (maxPrice && isNaN(Number(maxPrice))) {
      return res.status(400).json({
        success: false,
        message: "maxPrice must be a valid number",
      });
    }

    if (minRating && isNaN(Number(minRating))) {
      return res.status(400).json({
        success: false,
        message: "minRating must be a valid number",
      });
    }

    if (minRating && (Number(minRating) < 0 || Number(minRating) > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 0 and 5",
      });
    }

    // Total matching products
    const [totalProducts, products] = await Promise.all([
      Product.countDocuments(filter),

      Product.find(filter)
        .populate("category", "name")
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        limit,
        totalProducts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
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
