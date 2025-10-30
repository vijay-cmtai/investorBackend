const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const APIFeatures = require("../utils/apiFeatures");

exports.getUsers = asyncHandler(async (req, res) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await features.query;

  res.status(200).json({ success: true, count: users.length, data: users });
});

exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json({ success: true, data: user });
});

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

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await user.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

exports.getAssociates = asyncHandler(async (req, res) => {
  const associates = await User.find({ role: "Associate" });
  res
    .status(200)
    .json({ success: true, count: associates.length, data: associates });
});

exports.getCompanies = asyncHandler(async (req, res) => {
  const companies = await User.find({ role: "Company" });
  res
    .status(200)
    .json({ success: true, count: companies.length, data: companies });
});
