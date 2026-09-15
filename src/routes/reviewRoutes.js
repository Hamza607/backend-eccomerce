const express = require("express");
const {
  createReview,
  deleteReview,
  updateProductRating,
  updateReview,
} = require("../controllers/reviewController");

const router = express.Router();
const auth = require("../middleware/auth");

router.post("/", auth, createReview);
router.delete("/:id", auth, deleteReview);
router.put("/:id", auth, updateReview);
router.get("/product/:id", auth, updateProductRating);

module.exports = router;
