const Review = require("../models/ReviewModel");
const Property = require("../models/PropertyModel");
const asyncHandler = require("express-async-handler");

exports.getReviewsForProperty = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ property: req.params.id }).populate({
    path: "user",
    select: "name",
  });
  res.status(200).json({ success: true, count: reviews.length, data: reviews });
});
exports.createPropertyReview = asyncHandler(async (req, res) => {
  req.body.property = req.params.id;
  req.body.user = req.user.id;

  const property = await Property.findById(req.params.id);
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }
  const alreadyReviewed = await Review.findOne({
    property: req.params.id,
    user: req.user.id,
  });
  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already submitted a review for this property");
  }
  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});
