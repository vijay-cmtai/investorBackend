const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");

// @desc    Get all users (Admin)
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc    Get single user by ID (Admin)
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json({ success: true, data: user });
});

// @desc    Update user by ID (Admin)
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json({ success: true, data: user });
});

// @desc    Delete user by ID (Admin)
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await user.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

// @desc    Get all brokers (Admin)
exports.getBrokers = asyncHandler(async (req, res) => {
  const brokers = await User.find({ role: "broker" });
  res.status(200).json({ success: true, count: brokers.length, data: brokers });
});
