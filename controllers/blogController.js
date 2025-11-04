const Blog = require("../models/BlogModel");
const asyncHandler = require("express-async-handler");
exports.getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Blog.find({ status: "Published" })
    .populate("author", "name")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: posts.length, data: posts });
});
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

exports.createPost = asyncHandler(async (req, res) => {
  req.body.author = req.user.id; 
  const post = await Blog.create(req.body);
  res.status(201).json({ success: true, data: post });
});
