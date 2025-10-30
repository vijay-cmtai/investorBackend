// /routes/commissionRoutes.js

const express = require("express");
const {
  getAllCommissions,
  getMyCommissions,
  updateCommissionStatus,
} = require("../controllers/commissionController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const router = express.Router();

router.use(protect);

router.route("/").get(authorize("Admin", "Company"), getAllCommissions);

router.route("/my").get(authorize("Associate"), getMyCommissions);

router.route("/:id/status").put(authorize("Admin"), updateCommissionStatus);

module.exports = router;
