const express  = require("express");
const { addToCart, getCart, removeFromCart } = require("../controllers/cartController");
const auth = require("../middleware/auth");
const asynchandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(auth);

router.post("/add", asynchandler(addToCart));
router.get("/", asynchandler(getCart));
router.delete("/remove/:productId", asynchandler(removeFromCart));
router.put("/update/:productId", asynchandler(updateCartQuantity));

module.exports = router;