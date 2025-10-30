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

const getMySentInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find({ user: req.user._id })
    .populate("property", "title location")
    .populate("owner", "name email")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json({ success: true, count: inquiries.length, data: inquiries });
});

const getMyReceivedInquiries = asyncHandler(async (req, res) => {
  // --- YAHAN PAR ADMIN KE LIYE LOGIC ADD KIYA GAYA HAI ---
  // Agar user Admin hai, to saari inquiries dikhao.
  // Agar nahi, to sirf uski inquiries dikhao.
  const query = req.user.role === "Admin" ? {} : { owner: req.user._id };

  const inquiries = await Inquiry.find(query)
    .populate("property", "title location")
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json({ success: true, count: inquiries.length, data: inquiries });
});

const updateInquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const inquiry = await Inquiry.findById(req.params.id);

  if (!inquiry) {
    res.status(404);
    throw new Error("Inquiry not found");
  }

  // --- YAHAN PAR SECURITY CHECK KO UPDATE KIYA GAYA HAI ---
  // Check karo ki ya toh user Admin hai, YA phir woh inquiry ka owner hai.
  if (
    inquiry.owner.toString() !== req.user._id.toString() &&
    req.user.role !== "Admin"
  ) {
    res.status(401);
    throw new Error("Not authorized to update this inquiry");
  }

  inquiry.status = status;
  const updatedInquiry = await inquiry.save();

  res.status(200).json({ success: true, data: updatedInquiry });
});

const deleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);

  if (!inquiry) {
    res.status(404);
    throw new Error("Inquiry not found");
  }

  // --- YAHAN PAR BHI SECURITY CHECK UPDATE KIYA GAYA HAI ---
  // Sirf Admin, inquiry bhejne wala, ya inquiry receive karne wala hi delete kar sakta hai.
  if (
    req.user.role !== "Admin" &&
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
