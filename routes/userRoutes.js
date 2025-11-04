const express = require("express");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAssociates,
  getCompanies,
  updateUserProfile,
  changeUserPassword,
} = require("../controllers/userController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// === YEH SABSE ZAROORI BADLAV HAI ===
// Hum ab 'uploadProfile' ko direct object se nikal rahe hain
const { uploadProfile } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Ab hum 'upload' ki jagah 'uploadProfile' ka istemal karenge
router
  .route("/profile")
  .put(protect, uploadProfile.single("profileImage"), updateUserProfile);

router.route("/change-password").put(protect, changeUserPassword);

router.route("/").get(protect, authorize("Admin"), getUsers);
router.route("/associates").get(protect, authorize("Admin"), getAssociates);
router.route("/companies").get(protect, authorize("Admin"), getCompanies);

router
  .route("/:id")
  .get(protect, authorize("Admin"), getUserById)
  .put(protect, authorize("Admin"), updateUser)
  .delete(protect, authorize("Admin"), deleteUser);

module.exports = router;
