const Property = require("../models/PropertyModel");
const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");

exports.getProperties = asyncHandler(async (req, res) => {
  let query = Property.find({});
  if (req.user && req.user.role !== "Admin") {
    let userFilter = {};
    if (req.user.role === "Associate") {
      userFilter = { user: req.user.id };
    } else if (req.user.role === "Company") {
      const associates = await User.find({ referredBy: req.user.id }).select(
        "_id"
      );
      userFilter = {
        user: { $in: [req.user.id, ...associates.map((a) => a._id)] },
      };
    }
    query = query.where(userFilter);
  }
  if (req.query.isFeatured) query = query.where({ isFeatured: true });
  if (req.query.isHotDeal) query = query.where({ isHotDeal: true });
  if (req.query.property_type) {
    query = query.where({ property_type: req.query.property_type });
  }
  const properties = await query
    .populate("user", "name role")
    .sort({ createdAt: -1 });
  res
    .status(200)
    .json({ success: true, count: properties.length, data: properties });
});

exports.getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id)
    .populate("user", "name email role")
    .populate("reviews");
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }
  res.status(200).json({ success: true, data: property });
});

exports.createProperty = asyncHandler(async (req, res) => {
  const imageUrls = req.files ? req.files.map((file) => file.path) : [];
  const propertyData = { ...req.body, images: imageUrls, user: req.user.id };

  if (req.body.location) {
    propertyData.location = JSON.parse(req.body.location);
  }

  let assignedAssociate = req.body.assignedAssociate;
  if (assignedAssociate === "NONE" || !assignedAssociate) {
    assignedAssociate = null;
  }

  propertyData.commission = {
    percentage: req.body.commissionPercentage || 2,
    assignedAssociate: assignedAssociate,
  };

  if (req.user.role === "Admin") {
    propertyData.status = "Approved";
  }

  const property = await Property.create(propertyData);
  res.status(201).json({ success: true, data: property });
});

exports.updateProperty = asyncHandler(async (req, res) => {
  let property = await Property.findById(req.params.id);
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }
  if (property.user.toString() !== req.user.id && req.user.role !== "Admin") {
    res.status(401);
    throw new Error("Not authorized to update this property");
  }

  let updatedData = { ...req.body };

  if (req.files && req.files.length > 0) {
    updatedData.images = req.files.map((file) => file.path);
  }
  if (req.body.location && typeof req.body.location === "string") {
    updatedData.location = JSON.parse(req.body.location);
  }
  if (
    req.body.commissionPercentage ||
    req.body.assignedAssociate !== undefined
  ) {
    let assignedAssociate = req.body.assignedAssociate;
    if (assignedAssociate === "NONE" || assignedAssociate === "") {
      assignedAssociate = null;
    }
    updatedData.commission = {
      percentage:
        req.body.commissionPercentage || property.commission.percentage,
      assignedAssociate: assignedAssociate,
    };
  }
  property = await Property.findByIdAndUpdate(req.params.id, updatedData, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: property });
});
exports.deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }
  if (property.user.toString() !== req.user.id && req.user.role !== "Admin") {
    res.status(401);
    throw new Error("Not authorized to delete this property");
  }
  await property.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

exports.approveProperty = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndUpdate(
    req.params.id,
    { status: "Approved" },
    { new: true }
  );
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }
  res.status(200).json({ success: true, data: property });
});

exports.toggleHotDeal = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }
  property.isHotDeal = !property.isHotDeal;
  await property.save();
  res.status(200).json({ success: true, data: property });
});

exports.toggleFeatured = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }
  property.isFeatured = !property.isFeatured;
  await property.save();
  res.status(200).json({ success: true, data: property });
});

exports.toggleVerified = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }
  property.isVerified = !property.isVerified;
  await property.save();
  res.status(200).json({ success: true, data: property });
});
