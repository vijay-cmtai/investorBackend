const Lead = require("../models/LeadModel");
const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const APIFeatures = require("../utils/apiFeatures");

exports.createLead = asyncHandler(async (req, res) => {
  const { propertyId, customerName, customerEmail, customerPhone, message } =
    req.body;
  const lead = await Lead.create({
    property: propertyId,
    customerName,
    customerEmail,
    customerPhone,
    message,
    createdBy: req.user.id,
  });
  res.status(201).json({ success: true, data: lead });
});

exports.getAllLeads = asyncHandler(async (req, res) => {
  const features = new APIFeatures(
    Lead.find()
      .populate("property", "title")
      .populate("assignedTo", "name")
      .populate("notes.author", "name"),
    req.query
  )
    .filter()
    .sort()
    .paginate();
  const leads = await features.query;
  res.status(200).json({ success: true, count: leads.length, data: leads });
});

exports.getMyLeads = asyncHandler(async (req, res) => {
  const leads = await Lead.find({ assignedTo: req.user.id }).populate(
    "property",
    "title location"
  );
  res.status(200).json({ success: true, count: leads.length, data: leads });
});

exports.getLeadById = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }
  res.status(200).json({ success: true, data: lead });
});

exports.assignLead = asyncHandler(async (req, res) => {
  const { associateId } = req.body;
  const lead = await Lead.findByIdAndUpdate(
    req.params.id,
    { assignedTo: associateId, status: "Allocated" },
    { new: true, runValidators: true }
  )
    .populate("assignedTo", "name")
    .populate("property", "title");

  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }
  res.status(200).json({ success: true, data: lead });
});

exports.updateLeadStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }
  lead.status = status;
  await lead.save();
  res.status(200).json({ success: true, data: lead });
});

exports.deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }
  await lead.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

exports.addNoteToLead = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }
  const note = { content, author: req.user.id };
  lead.notes.unshift(note);
  await lead.save();
  const populatedLead = await Lead.findById(lead._id)
    .populate("property", "title")
    .populate("assignedTo", "name")
    .populate("notes.author", "name");
  res.status(201).json({ success: true, data: populatedLead });
});
