const logger = (req, res, next) => {
  console.log("======= New Request ==========");
  console.log("Method :", req.method);
  console.log("URL :", req.originalUrl);
  console.log("Time :", new Date().toLocaleString());
  
  next()
};

module.exports = logger