const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  addToWishList,
  getWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlist,
} = require("../controllers/whishListController");

router.use(auth);

router.post("/", addToWishList);

router.get("/", getWishlist);

router.delete("/:productId", removeFromWishlist);

router.delete("/", clearWishlist);
router.delete("/check/:productId", checkWishlist);

module.exports = router;
