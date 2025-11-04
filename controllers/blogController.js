const Blog = require("../models/BlogModel");
const asyncHandler = require("express-async-handler");

// Public: Gets only published posts
exports.getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Blog.find({ status: "Published" })
    .populate("author", "name")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: posts.length, data: posts });
});

// Admin: Gets ALL posts (including drafts)
exports.getAdminAllPosts = asyncHandler(async (req, res) => {
  const posts = await Blog.find({})
    .populate("author", "name")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: posts.length, data: posts });
});

// Public: Gets a single post by slug
exports.getPostBySlug = asyncHandler(async (req, res) => {
  const post = await Blog.findOne({ slug: req.params.slug }).populate(
    "author",
    "name"
  );
  if (!post) {
    res.status(404);
    throw new Error("Blog post not found");
  }
  res.status(200).json({ success: true, data: post });
});

// Admin: Create a new post
exports.createPost = asyncHandler(async (req, res) => {
  req.body.author = req.user.id;
  const post = await Blog.create(req.body);
  res.status(201).json({ success: true, data: post });
});

// Admin: Update a post by ID
exports.updatePost = asyncHandler(async (req, res) => {
  let post = await Blog.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Blog post not found");
  }
  post = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: post });
});

// Admin: Delete a post by ID
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Blog.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Blog post not found");
  }
  await post.deleteOne();
  res.status(200).json({ success: true, data: {} });
});
