const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

module.exports = logger;

// const logger = (req, res, next) => {
//   console.log("======= New Request ==========");
//   console.log("Method :", req.method);
//   console.log("URL :", req.originalUrl);
//   console.log("Time :", new Date().toLocaleString());

//   next()
// };

// module.exports = logger
