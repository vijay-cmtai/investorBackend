const express = require("express");
const {
  createInquiry,
  getMySentInquiries,
  getMyReceivedInquiries,
  updateInquiryStatus,
  deleteInquiry,
} = require("../controllers/inquiryController.js");
const { protect } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.route("/").post(protect, createInquiry);
router.route("/sent").get(protect, getMySentInquiries);
router.route("/received").get(protect, getMyReceivedInquiries);
router.route("/:id").delete(protect, deleteInquiry); 
router.route("/:id/status").put(protect, updateInquiryStatus);
module.exports = router;
