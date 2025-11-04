const express = require("express");
const router = express.Router();
const {
  getAdminDashboardStats,
  getCompanyDashboardStats,
  getRecentProperties,
  getRecentLeads,
} = require("../controllers/dashboardController");
const { protect, authorize } = require("../middlewares/authMiddleware.js");
router
  .route("/admin/stats")
  .get(protect, authorize("admin"), getAdminDashboardStats);

router
  .route("/admin/recent-properties")
  .get(protect, authorize("admin"), getRecentProperties);

router
  .route("/admin/recent-leads")
  .get(protect, authorize("admin"), getRecentLeads);
router.route("/company/stats").get(protect, getCompanyDashboardStats);

router.route("/company/recent-properties").get(protect, getRecentProperties);

router.route("/company/recent-leads").get(protect, getRecentLeads);

module.exports = router;
