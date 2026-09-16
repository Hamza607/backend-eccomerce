// const errorMiddleware = (err, req, res, next) => {
//   console.error(err);

//   let statusCode = err.statusCode || 500;
//   let message = err.message || "Internal server error";

//   if (err.name === "CastError") {
//     statusCode = 400;
//     message = "Invalid ID";
//   }
//   if (err.name === "ValidationError") {
//     statusCode = 400;
//     message = Object
//       .values(err.errors)
//       .map((error) => error.message)
//       .join(", ");
//   }

//   res.status(statusCode).json({
//     success: false,
//     message,
//   });
// };

// module.exports = errorMiddleware;


const logger = require("./logger");

const AppError = require("../utils/AppError");

const errorMiddleware = (err, req, res, next) => {
  
logger.error({
  message: err.message,
  // stack: err.stack,
  method: req.method,
  url: req.originalUrl,
});

  let error = err;

  // Mongoose CastError
  if (err.name === "CastError") {
    error = new AppError(
      `Invalid ${err.path}: ${err.value}`,
      400
    );
  }

  // Mongoose ValidationError
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(
      (item) => item.message
    );

    error = new AppError(
      messages.join(", "),
      400
    );
  }

  // Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];

    error = new AppError(
      `${field} already exists`,
      400
    );
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError(
      "Invalid token",
      401
    );
  }

  if (err.name === "TokenExpiredError") {
    error = new AppError(
      "Token has expired",
      401
    );
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    status: error.status || "error",
    message: error.message || "Internal Server Error",

    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
    }),
  });
};

module.exports = errorMiddleware;