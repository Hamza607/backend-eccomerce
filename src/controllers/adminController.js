const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),

      Order.countDocuments({ orderStatus: "pending" }),
      Order.countDocuments({ orderStatus: "processing" }),
      Order.countDocuments({ orderStatus: "shipped" }),
      Order.countDocuments({ orderStatus: "delivered" }),
      Order.countDocuments({ orderStatus: "cancelled" }),
    ]);
    // Revenue
    const revenueResult = await Order.aggregate([
      {
        $match: {
          orderStatus: "delivered",
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Recent orders
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    // Low stock products
    const lowStockProducts = await Product.find({
      stock: { $lte: 5 },
    })
      .select("name price stock image")
      .sort({ stock: 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue,
        },

        orders: {
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },

        recentOrders,

        lowStockProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMonthlySales = async (req, res, next) => {
  try {
    const sales = await Order.aggregate([
      {
        $match: {
          orderStatus: "delivered",
          paymentStatus: "paid",
        },
      },

      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
          },

          totalSales: {
            $sum: "$totalAmount",
          },

          totalOrders: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: sales,
    });
  } catch (error) {
    next(error);
  }
};

const getTopSellingProducts = async (req, res, next) => {
  try {
    const topProducts = await Product.aggregate([
      // 1. serf successfull order
      {
        $match: {
          orderStatus: "delivered",
          paymentStatus: "paid",
        },
      },
      // 2. orderItems array ko separate documents mein convert
      {
        $unwind: "$orderItems",
      },
      // 3. Product ke according group
      {
        $group: {
          _id: "$orderItems.product",
          productName: {
            $first: "$orderItems.name",
          },
          totalSold: {
            $sum: "$orderItems.quantity",
          },
          totalRevenue: {
            $sum: {
              $multiply: ["$orderItems.price", "$orderItems.quantity"],
            },
          },
        },
      },
      //  4.  high selling product
      {
        $sort: {
          totalSold: -1,
        },
      },
      // 5.  top 10
      {
        $limit: 10,
      },
    ]);
    res.status(200).json({
      success: true,
      data: topProducts,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getDashboardStats,
  getMonthlySales,
  getTopSellingProducts,
};
