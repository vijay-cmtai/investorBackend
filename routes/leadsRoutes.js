// /routes/leadRoutes.js

const express = require("express");
const {
  createLead,
  getAllLeads,
  getMyLeads,
  getLeadById,
  updateLeadStatus,
  assignLead,
  deleteLead,
} = require("../controllers/leadController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(authorize("Customer", "Associate", "Company", "Admin"), createLead)
  .get(authorize("Company", "Admin"), getAllLeads);

router.get("/my", authorize("Associate"), getMyLeads);

router
  .route("/:id")
  .get(authorize("Associate", "Company", "Admin"), getLeadById)
  .delete(authorize("Admin"), deleteLead);

router.route("/:id/assign").put(authorize("Company", "Admin"), assignLead);

router
  .route("/:id/status")
  .put(authorize("Associate", "Admin"), updateLeadStatus);

module.exports = router;
