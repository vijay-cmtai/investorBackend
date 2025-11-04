const Sale = require("../models/SaleModel");
const Property = require("../models/PropertyModel");
const Commission = require("../models/CommissionModel");
const asyncHandler = require("express-async-handler");

exports.createSale = asyncHandler(async (req, res) => {
  const { property: propertyId, buyer, salePrice } = req.body;

  if (!propertyId || !buyer || !buyer.name || !buyer.email || !salePrice) {
    res.status(400);
    throw new Error("Property ID, buyer details, and sale price are required.");
  }
  const property = await Property.findById(propertyId);
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }
  if (property.status === "Sold") {
    res.status(400);
    throw new Error("This property has already been sold.");
  }
  const commissionPercentage = property.commission?.percentage || 2;
  const totalCommissionAmount = salePrice * (commissionPercentage / 100);

  const sale = await Sale.create({
    property: propertyId,
    buyer: { name: buyer.name, email: buyer.email },
    sellerAssociate: property.user,
    salePrice,
    commissionPercentage,
    totalCommissionAmount,
  });

  if (property.commission?.assignedAssociate) {
    await Commission.create({
      sale: sale._id,
      user: property.commission.assignedAssociate,
      amount: totalCommissionAmount,
      level: 1,
      status: "Pending",
    });
  }

  property.status = "Sold";
  await property.save();

  res
    .status(201)
    .json({
      success: true,
      message: "Sale recorded and commission generated!",
      data: sale,
    });
});
exports.getAllSales = asyncHandler(async (req, res) => {
  const sales = await Sale.find({})
    .populate("property", "title")
    .populate("sellerAssociate", "name");
  res.status(200).json({ success: true, count: sales.length, data: sales });
});
