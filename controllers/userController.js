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
  res.status(200).json({ success: true, message: "User deleted successfully" });
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

exports.updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.file) {
      user.profileImage = req.file.path;
    }
    const updatedUser = await user.save();
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      profileImage: updatedUser.profileImage,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

exports.changeUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Please provide current and new passwords");
  }
  const user = await User.findById(req.user.id).select("+password");

  if (!user || !(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Invalid current password");
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: "Password updated successfully" });
});
