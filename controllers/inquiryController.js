const Inquiry = require("../models/inquiryModel.js");
const Property = require("../models/PropertyModel.js");
const User = require("../models/UserModel.js");
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
    .populate("assignedTo", "name email role")
    .populate("notes.addedBy", "name email role")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json({ success: true, count: inquiries.length, data: inquiries });
});

const getMyReceivedInquiries = asyncHandler(async (req, res) => {
  let query = {};
  const userRole = req.user.role;
  const userId = req.user._id;

  if (userRole === "Admin") {
    query = {};
  } else if (["Associate", "Broker", "Company"].includes(userRole)) {
    query = { assignedTo: userId };
  } else {
    query = { owner: userId };
  }

  const inquiries = await Inquiry.find(query)
    .populate("property", "title location")
    .populate("user", "name email")
    .populate("owner", "name email")
    .populate("assignedTo", "name email role")
    .populate("assignedBy", "name email")
    .populate({
      path: "notes",
      populate: {
        path: "addedBy",
        select: "name email role",
      },
    })
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json({ success: true, count: inquiries.length, data: inquiries });
});

const assignInquiry = asyncHandler(async (req, res) => {
  const { employeeId, priority } = req.body;
  const inquiryId = req.params.id;

  if (req.user.role !== "Admin") {
    res.status(403);
    throw new Error("Only admins can assign inquiries");
  }

  const inquiry = await Inquiry.findById(inquiryId);
  if (!inquiry) {
    res.status(404);
    throw new Error("Inquiry not found");
  }

  const employee = await User.findById(employeeId);
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  if (!["Associate", "Broker", "Company"].includes(employee.role)) {
    res.status(400);
    throw new Error(
      "Invalid employee role. Must be Associate, Broker, or Company"
    );
  }

  inquiry.assignedTo = employeeId;
  inquiry.assignedBy = req.user._id;
  inquiry.assignedAt = new Date();
  inquiry.status = "Assigned";
  if (priority) {
    inquiry.priority = priority;
  }
  inquiry.notes.push({
    note: `Inquiry assigned to ${employee.name} (${employee.role})`,
    addedBy: req.user._id,
  });

  const updatedInquiry = await inquiry.save();
  await updatedInquiry.populate([
    { path: "assignedTo", select: "name email role" },
    { path: "assignedBy", select: "name email" },
    { path: "notes.addedBy", select: "name email role" },
  ]);

  res.status(200).json({
    success: true,
    message: "Inquiry assigned successfully",
    data: updatedInquiry,
  });
});

const updateInquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const inquiry = await Inquiry.findById(req.params.id);

  if (!inquiry) {
    res.status(404);
    throw new Error("Inquiry not found");
  }

  const isAdmin = req.user.role === "Admin";
  const isOwner = inquiry.owner.toString() === req.user._id.toString();
  const isAssigned =
    inquiry.assignedTo &&
    inquiry.assignedTo.toString() === req.user._id.toString();

  if (!isAdmin && !isOwner && !isAssigned) {
    res.status(401);
    throw new Error("Not authorized to update this inquiry");
  }

  const oldStatus = inquiry.status;
  inquiry.status = status;
  inquiry.notes.push({
    note: `Status changed from ${oldStatus} to ${status}`,
    addedBy: req.user._id,
  });

  const updatedInquiry = await inquiry.save();
  await updatedInquiry.populate([
    { path: "assignedTo", select: "name email role" },
    { path: "assignedBy", select: "name email" },
    { path: "notes.addedBy", select: "name email role" },
    { path: "property", select: "title location" },
    { path: "user", select: "name email" },
    { path: "owner", select: "name email" },
  ]);

  res.status(200).json({ success: true, data: updatedInquiry });
});

const addNoteToInquiry = asyncHandler(async (req, res) => {
  const { note } = req.body;
  const inquiryId = req.params.id;

  if (!note || note.trim() === "") {
    res.status(400);
    throw new Error("Note content is required");
  }

  const inquiry = await Inquiry.findById(inquiryId);
  if (!inquiry) {
    res.status(404);
    throw new Error("Inquiry not found");
  }

  const isAdmin = req.user.role === "Admin";
  const isOwner = inquiry.owner.toString() === req.user._id.toString();
  const isAssigned =
    inquiry.assignedTo &&
    inquiry.assignedTo.toString() === req.user._id.toString();

  if (!isAdmin && !isOwner && !isAssigned) {
    res.status(401);
    throw new Error("Not authorized to add notes to this inquiry");
  }

  inquiry.notes.push({
    note: note.trim(),
    addedBy: req.user._id,
  });

  const updatedInquiry = await inquiry.save();
  await updatedInquiry.populate([
    { path: "notes.addedBy", select: "name email role" },
    { path: "assignedTo", select: "name email role" },
    { path: "assignedBy", select: "name email" },
    { path: "property", select: "title location" },
    { path: "user", select: "name email" },
    { path: "owner", select: "name email" },
  ]);

  res.status(200).json({
    success: true,
    message: "Note added successfully",
    data: updatedInquiry,
  });
});

const updateInquiryPriority = asyncHandler(async (req, res) => {
  const { priority } = req.body;
  const inquiryId = req.params.id;

  if (req.user.role !== "Admin") {
    res.status(403);
    throw new Error("Only admins can update priority");
  }

  const inquiry = await Inquiry.findById(inquiryId);
  if (!inquiry) {
    res.status(404);
    throw new Error("Inquiry not found");
  }

  const oldPriority = inquiry.priority;
  inquiry.priority = priority;
  inquiry.notes.push({
    note: `Priority changed from ${oldPriority} to ${priority}`,
    addedBy: req.user._id,
  });

  const updatedInquiry = await inquiry.save();
  await updatedInquiry.populate([
    { path: "notes.addedBy", select: "name email role" },
    { path: "assignedTo", select: "name email role" },
    { path: "assignedBy", select: "name email" },
    { path: "property", select: "title location" },
    { path: "user", select: "name email" },
    { path: "owner", select: "name email" },
  ]);

  res.status(200).json({
    success: true,
    message: "Priority updated successfully",
    data: updatedInquiry,
  });
});

const deleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) {
    res.status(404);
    throw new Error("Inquiry not found");
  }

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

const getEmployeesForAssignment = asyncHandler(async (req, res) => {
  if (req.user.role !== "Admin") {
    res.status(403);
    throw new Error("Only admins can access this");
  }

  const employees = await User.find({
    role: { $in: ["Associate", "Broker", "Company"] },
    isActive: true,
  }).select("name email role");

  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees,
  });
});

module.exports = {
  createInquiry,
  getMySentInquiries,
  getMyReceivedInquiries,
  assignInquiry,
  updateInquiryStatus,
  addNoteToInquiry,
  updateInquiryPriority,
  deleteInquiry,
  getEmployeesForAssignment,
};
