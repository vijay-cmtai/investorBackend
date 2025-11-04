const express = require("express");
const {
  getAllPosts,
  getPostBySlug,
  createPost,
} = require("../controllers/blogController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const router = express.Router();
router
  .route("/")
  .get(getAllPosts)
  .post(protect, authorize("Admin"), createPost); 
router.route("/:slug").get(getPostBySlug);

module.exports = router;
