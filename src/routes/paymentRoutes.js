const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const {
  createPayment,
  createStripePayment,
} = require("../controllers/paymentController");

// router.post("/", auth, asyncHandler(createPayment));
router.post("/stripe/create", auth, createStripePayment);

module.exports = router;
