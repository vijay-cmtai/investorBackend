const express = require("express");
const {
  getWishlist,
  toggleWishlist,
} = require("../controllers/wishlistController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").get(protect, getWishlist).post(protect, toggleWishlist);

module.exports = router;
