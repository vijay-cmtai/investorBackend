const Commission = require("../models/CommissionModel");
const asyncHandler = require("express-async-handler");

exports.getAllCommissions = asyncHandler(async (req, res) => {
  const commissions = await Commission.find({})
    .populate("user", "name email") 
    .populate({
      path: "sale",
      select: "property", 
      populate: {
        path: "property", 
        select: "title", 
      },
    });

  res
    .status(200)
    .json({ success: true, count: commissions.length, data: commissions });
});

exports.getMyCommissions = asyncHandler(async (req, res) => {
  const commissions = await Commission.find({ user: req.user.id }).populate({
    path: "sale",
    populate: { path: "property", select: "title" },
  });
  res
    .status(200)
    .json({ success: true, count: commissions.length, data: commissions });
});

exports.updateCommissionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status || !["Paid", "Pending", "Cancelled"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status provided.");
  }
  const commission = await Commission.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  )
    .populate("user", "name email")
    .populate({
      path: "sale",
      populate: { path: "property", select: "title" },
    });
  if (!commission) {
    res.status(404);
    throw new Error("Commission record not found");
  }
  res.status(200).json({ success: true, data: commission });
});
