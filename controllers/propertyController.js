const Property = require("../models/PropertyModel");
const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");

exports.getProperties = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user && req.user.role !== "Admin") {
    const userRole = req.user.role;
    const userId = req.user.id;
    if (userRole === "Associate") {
      query = { user: userId };
    } else if (userRole === "Company") {
      const associates = await User.find({ referredBy: userId }).select("_id");
      const associateIds = associates.map((a) => a._id);
      const userIds = [userId, ...associateIds];
      query = { user: { $in: userIds } };
    }
  }
  const properties = await Property.find(query)
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
  const {
    title,
    description,
    price,
    location,
    property_type,
    transaction_type,
    bedrooms,
    bathrooms,
    square_feet,
    commissionPercentage,
    assignedAssociate,
  } = req.body;
  let parsedLocation;
  if (!location) {
    res.status(400);
    throw new Error("Location data is required.");
  }
  try {
    parsedLocation =
      typeof location === "string" ? JSON.parse(location) : location;
  } catch (e) {
    res.status(400);
    throw new Error("Invalid location JSON format.");
  }
  const imageUrls = req.files ? req.files.map((file) => file.path) : [];
  const propertyData = {
    title,
    description,
    price,
    bedrooms,
    bathrooms,
    square_feet,
    location: parsedLocation,
    images: imageUrls,
    property_type,
    transaction_type,
    user: req.user.id,
    commission: {
      percentage: commissionPercentage || 2,
      assignedAssociate: assignedAssociate || null,
    },
  };
  if (req.user.role === "Admin") {
    propertyData.status = "Approved";
  } else {
    propertyData.status = "Pending";
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
  if (req.body.location && typeof req.body.location === "string") {
    updatedData.location = JSON.parse(req.body.location);
  }
  if (req.body.commissionPercentage || req.body.assignedAssociate) {
    updatedData.commission = {
      ...property.commission,
      percentage: req.body.commissionPercentage,
      assignedAssociate: req.body.assignedAssociate,
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
