const Inquiry = require("../models/inquiryModel.js");
const Property = require("../models/PropertyModel.js");
const asyncHandler = require("express-async-handler");
const createInquiry = asyncHandler(async (req, res) => {
  const { propertyId, name, email, phone, message } = req.body;
  const userId = req.user._id;

  const property = await Property.findById(propertyId);

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  if (property.user.toString() === userId.toString()) {
    res.status(400);
    throw new Error("You cannot send an inquiry for your own property.");
  }

  const inquiry = await Inquiry.create({
    user: userId,
    owner: property.user, 
    property: propertyId,
    name,
    email,
    phone,
    message,
  });

  if (inquiry) {
    res.status(201).json({
      success: true,
      message: "Inquiry sent successfully!",
      data: inquiry,
    });
  } else {
    res.status(400);
    throw new Error("Invalid inquiry data");
  }
});

// @desc    Get inquiries sent by the logged-in user
// @route   GET /api/inquiries/sent
// @access  Private
const getMySentInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find({ user: req.user._id })
    .populate("property", "title location") 
    .populate("owner", "name email") 
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json({ success: true, count: inquiries.length, data: inquiries });
});

// @desc    Get inquiries received by the logged-in user (for their properties)
// @route   GET /api/inquiries/received
// @access  Private
const getMyReceivedInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find({ owner: req.user._id })
    .populate("property", "title location") 
    .populate("user", "name email") 
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json({ success: true, count: inquiries.length, data: inquiries });
});

// @desc    Update inquiry status (by property owner)
// @route   PUT /api/inquiries/:id/status
// @access  Private
const updateInquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const inquiry = await Inquiry.findById(req.params.id);

  if (!inquiry) {
    res.status(404);
    throw new Error("Inquiry not found");
  }

  if (inquiry.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to update this inquiry");
  }

  inquiry.status = status;
  const updatedInquiry = await inquiry.save();

  res.status(200).json({ success: true, data: updatedInquiry });
});

// @desc    Delete an inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private
const deleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);

  if (!inquiry) {
    res.status(404);
    throw new Error("Inquiry not found");
  }

  if (
    inquiry.user.toString() !== req.user._id.toString() &&
    inquiry.owner.toString() !== req.user._id.toString()
  ) {
    res.status(401);
    throw new Error("Not authorized to delete this inquiry");
  }

  await inquiry.deleteOne();

  res
    .status(200)
    .json({ success: true, message: "Inquiry deleted successfully" });
});

module.exports = {
  createInquiry,
  getMySentInquiries,
  getMyReceivedInquiries,
  updateInquiryStatus,
  deleteInquiry,
};
