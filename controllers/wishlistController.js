const asyncHandler = require("express-async-handler");
const Wishlist = require("../models/WishlistModel");

exports.getWishlist = asyncHandler(async (req, res) => {
  const wishlistItems = await Wishlist.find({ user: req.user.id }).populate({
    path: "property",
    populate: {
      path: "user",
      select: "name email",
    },
  });

  res.status(200).json({ success: true, data: wishlistItems });
});

exports.toggleWishlist = asyncHandler(async (req, res) => {
  const { propertyId } = req.body;
  const userId = req.user.id;

  if (!propertyId) {
    res.status(400);
    throw new Error("Property ID is required");
  }

  const existingItem = await Wishlist.findOne({
    user: userId,
    property: propertyId,
  });

  if (existingItem) {
    await existingItem.deleteOne();
    res
      .status(200)
      .json({
        success: true,
        message: "Removed from wishlist",
        data: { propertyId },
      });
  } else {
    await Wishlist.create({ user: userId, property: propertyId });
    res
      .status(201)
      .json({
        success: true,
        message: "Added to wishlist",
        data: { propertyId },
      });
  }
});
