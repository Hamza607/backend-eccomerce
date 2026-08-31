const express = require("express");
const productRoutes = require("./routes/productroutes");
const categories = require("./routes/categoriesroutes");
const authRoutes = require("./routes/authRoutes");
const logger = require("./middleware/logger");
const errorMiddleware = require("./middleware/errorMiddleware");
const path = require("path");

const app = express();

app.use(express.json());

app.use(logger);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/products", productRoutes);
app.use("/api/categories", categories);
app.use("/api/auth", authRoutes);

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
