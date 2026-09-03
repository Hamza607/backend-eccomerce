const express = require("express");
const {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} = require("../controllers/cartController");
const auth = require("../middleware/auth");
const asynchandler = require("../utils/asyncHandler");
const {
  addToCartValidation,
  updateCartQuantityValidation,
  removeFromCartValidation,
} = require("../validations/cartValidator");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(auth);

router.post("/", addToCartValidation, validate, asynchandler(addToCart));
router.get("/", asynchandler(getCart));
router.delete(
  "/remove/:productId",
  removeFromCartValidation,
  validate,
  asynchandler(removeFromCart),
);
router.put(
  "/:productId",
  updateCartQuantityValidation,
  validate,
  asynchandler(updateCartQuantity),
);
router.delete("/clear", asynchandler(clearCart));

module.exports = router;
