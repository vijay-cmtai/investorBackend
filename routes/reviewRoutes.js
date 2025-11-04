const express = require("express");
const {
  createPropertyReview,
  getReviewsForProperty,
} = require("../controllers/reviewController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getReviewsForProperty)
  .post(protect, createPropertyReview);

module.exports = router;
