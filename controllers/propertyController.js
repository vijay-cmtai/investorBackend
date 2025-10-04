const Property = require("../models/PropertyModel");
const asyncHandler = require("express-async-handler");

exports.getProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({}).populate("user", "name role");
  res
    .status(200)
    .json({ success: true, count: properties.length, data: properties });
});

exports.getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate(
    "user",
    "name email"
  );
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
    yearBuilt,
    furnishingStatus,
    amenities,
    isFeatured,
  } = req.body;

  let parsedLocation;
  if (!location) {
    res.status(400);
    throw new Error("Location data is required.");
  }
  try {
    parsedLocation = JSON.parse(location);
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
    yearBuilt,
    furnishingStatus,
    isFeatured,
    location: parsedLocation,

    
    amenities: amenities || [],

    images: imageUrls,
    property_type,
    transaction_type,
    user: req.user.id,
  };

  if (req.user.role === "admin") {
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
  if (property.user.toString() !== req.user.id && req.user.role !== "admin") {
    res.status(401);
    throw new Error("Not authorized to update this property");
  }

  let updatedData = { ...req.body };

  if (req.body.location) {
    updatedData.location = JSON.parse(req.body.location);
  }

  if (req.body.amenities) {
    updatedData.amenities =
      typeof req.body.amenities === "string"
        ? req.body.amenities.split(",")
        : req.body.amenities;
  }

  if (req.files && req.files.length > 0) {
    const newImageUrls = req.files.map((file) => file.path);
    updatedData.images = [...(property.images || []), ...newImageUrls];
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
  if (property.user.toString() !== req.user.id && req.user.role !== "admin") {
    res.status(401);
    throw new Error("Not authorized to delete this property");
  }
  await property.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

exports.approveProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }
  property.status = "Approved";
  await property.save();
  res.status(200).json({ success: true, data: property });
});

exports.getMyProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({ user: req.user.id });
  res
    .status(200)
    .json({ success: true, count: properties.length, data: properties });
});
