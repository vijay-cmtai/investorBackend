const express = require("express");
const {
  getAllPosts,
  getPostBySlug,
  createPost,
  getAdminAllPosts,
  updatePost,
  deletePost,
} = require("../controllers/blogController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

// Admin route to get ALL posts
router.route("/admin/all").get(protect, authorize("Admin"), getAdminAllPosts);

// Public route to get published posts
router
  .route("/")
  .get(getAllPosts)
  .post(protect, authorize("Admin"), createPost);

// Public route for single post view
router.route("/:slug").get(getPostBySlug);

// Admin routes for update and delete by ID
router
  .route("/:id")
  .put(protect, authorize("Admin"), updatePost)
  .delete(protect, authorize("Admin"), deletePost);

module.exports = router;
