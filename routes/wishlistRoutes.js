// /routes/wishlistRoutes.js

const express = require("express");
const {
  getWishlist,
  toggleWishlist,
} = require("../controllers/wishlistController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.use(protect);

router.route("/").get(getWishlist).post(toggleWishlist);

module.exports = router;
