require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const productRoutes = require("./routes/productroutes");
const categories = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const adminRoutes = require("./routes/adminRoutes");
// const logger = require("./middleware/logger");
const errorMiddleware = require("./middleware/errorMiddleware");
const path = require("path");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: {
    success: false,
    message: "Too many request,  please try again later.",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Ecommerce API is running",
  });
});
// app.post(
//   "/api/payments/stripe/webhook",
//   express.raw({ type: "application/json" }),
//   stripeWebhook,
// );

app.use(express.json());
// app.use(logger);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/products", productRoutes);
app.use("/api/categories", categories);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
// app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Backend Running...",
  });
});

//proper error for wrong routes
app.use((req, res, next) => {
  const error = new Error(`Routes not found : ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});
// Global Error Middleware
app.use(errorMiddleware);

module.exports = app;
