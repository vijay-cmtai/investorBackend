const express = require("express");
const {
  register,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { uploadProfile } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/me", protect, getMe);
router.put(
  "/me/update",
  protect,
  uploadProfile.single("profileImage"),
  updateMe
);

module.exports = router;
