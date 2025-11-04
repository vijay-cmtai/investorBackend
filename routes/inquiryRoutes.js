const express = require("express");
const {
  createInquiry,
  getMySentInquiries,
  getMyReceivedInquiries,
  assignInquiry,
  updateInquiryStatus,
  addNoteToInquiry,
  updateInquiryPriority,
  deleteInquiry,
  getEmployeesForAssignment,
} = require("../controllers/inquiryController.js");
const { protect } = require("../middlewares/authMiddleware.js");

const router = express.Router();

// Basic CRUD
router.route("/").post(protect, createInquiry);
router.route("/sent").get(protect, getMySentInquiries);
router.route("/received").get(protect, getMyReceivedInquiries);
router.route("/:id").delete(protect, deleteInquiry);

// Assignment & Management
router.route("/:id/assign").put(protect, assignInquiry);
router.route("/:id/status").put(protect, updateInquiryStatus);
router.route("/:id/priority").put(protect, updateInquiryPriority);
router.route("/:id/notes").post(protect, addNoteToInquiry);
router.route("/employees/list").get(protect, getEmployeesForAssignment);

module.exports = router;
