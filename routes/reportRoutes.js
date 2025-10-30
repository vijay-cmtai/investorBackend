const express = require("express");
const {
  getPropertyReportsByLocation,
  getLeadPerformanceReport,
  getSalesPerformanceReport,
} = require("../controllers/reportsController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const router = express.Router();

router.use(protect);
router.use(authorize("Admin", "Company"));

router.get("/properties/by-location", getPropertyReportsByLocation);
router.get("/leads/performance", getLeadPerformanceReport);
router.get("/sales/performance", getSalesPerformanceReport);

module.exports = router;
