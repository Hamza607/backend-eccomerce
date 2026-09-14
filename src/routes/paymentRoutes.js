const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const { createPayment } = require("../controllers/paymentController");

router.post("/", auth, asyncHandler(createPayment));

module.exports = router;
