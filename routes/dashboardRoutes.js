const express = require("express");
const { getDashboardStats } = require("../controllers/dashboardController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.route("/stats").get(getDashboardStats);

module.exports = router;
