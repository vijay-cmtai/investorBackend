// /routes/userRoutes.js

const express = require("express");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAssociates,
  getCompanies,
} = require("../controllers/userController");

const { protect, authorize } = require("../middlewares/authMiddleware");
const router = express.Router();

router.use(protect);
router.use(authorize("Admin"));

router.route("/").get(getUsers);
router.route("/associates").get(getAssociates);
router.route("/companies").get(getCompanies);

router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

module.exports = router;
