const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const sendEmail = require("../utils/mailer");

const sendTokenResponse = (user, statusCode, res, message = "") => {
  const token = user.getSignedJwtToken();
  const { _id, name, email, role, profileImage } = user;
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: { id: _id, name, email, role, profileImage },
  });
};

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error("Name, email, password, and role are required.");
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error("User with this email already exists.");
  }
  if (role === "Admin") {
    const adminUser = await User.create({
      name,
      email,
      password,
      role: "Admin",
      isVerified: true,
    });
    sendTokenResponse(
      adminUser,
      201,
      res,
      "Admin account created successfully."
    );
  } else {
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const emailHtml = `<div><h2>Welcome to Investorsdeaal!</h2><p>Hi ${name}, your OTP for email verification is:</p><p>${otp}</p><p>This OTP is valid for 10 minutes.</p></div>`;
    await User.create({ name, email, password, role, otp, otpExpiry });
    await sendEmail(email, "Verify Your Email Address", emailHtml);
    res
      .status(201)
      .json({
        success: true,
        message: `User registration initiated. An OTP has been sent to ${email}.`,
      });
  }
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400);
    throw new Error("Email and OTP are required.");
  }
  const user = await User.findOne({
    email,
    otp,
    otpExpiry: { $gt: Date.now() },
  });
  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired OTP.");
  }
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();
  sendTokenResponse(user, 200, res, "Email verified successfully!");
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }
  if (!user.isVerified) {
    res.status(403);
    throw new Error(
      "Account not verified. Please check your email for the verification OTP."
    );
  }
  sendTokenResponse(user, 200, res, "Login successful!");
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = name || user.name;
  user.email = email || user.email;

  if (req.file) {
    user.profileImage = req.file.path;
  }

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("There is no user with that email address.");
  }
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.forgotPasswordExpiry = Date.now() + 10 * 60 * 1000;
  await user.save();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const emailHtml = `<p>Please click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`;
  try {
    await sendEmail(user.email, "Password Reset Request", emailHtml);
    res
      .status(200)
      .json({
        success: true,
        message: "Password reset link sent to your email!",
      });
  } catch (err) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();
    res.status(500);
    throw new Error("Email could not be sent.");
  }
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) {
    res.status(400);
    throw new Error("Password is required.");
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });
  if (!user) {
    res.status(400);
    throw new Error("Token is invalid or has expired.");
  }
  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();
  sendTokenResponse(user, 200, res, "Password has been reset successfully.");
});
