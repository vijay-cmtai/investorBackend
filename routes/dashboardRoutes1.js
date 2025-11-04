// /routes/dashboardRoutes1.js
const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getRecentProperties,
  getRecentLeads,
} = require("../controllers/dashboardController1");

router.get("/stats", getDashboardStats);
router.get("/recent-properties", getRecentProperties);
router.get("/recent-leads", getRecentLeads);

module.exports = router;
