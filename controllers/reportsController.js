const Property = require("../models/PropertyModel");
const Lead = require("../models/LeadModel");
const Sale = require("../models/SaleModel");
const asyncHandler = require("express-async-handler");

exports.getPropertyReportsByLocation = asyncHandler(async (req, res) => {
  const stats = await Property.aggregate([
    {
      $group: {
        _id: "$location.city",
        // count ki jagah numProperties tha, use 'count' kiya gaya hai
        count: { $sum: 1 },
        // avgPrice ki jagah averagePrice kiya gaya hai aur Lakhs mein convert kiya gaya hai
        averagePrice: { $avg: { $divide: ["$price", 100000] } },
      },
    },
    {
      $project: {
        _id: 1,
        count: 1,
        // averagePrice ko 2 decimal places tak round off kiya gaya hai
        averagePrice: { $round: ["$averagePrice", 2] },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  res.status(200).json({ success: true, data: stats });
});

exports.getLeadPerformanceReport = asyncHandler(async (req, res) => {
  const stats = await Lead.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({ success: true, data: stats });
});

exports.getSalesPerformanceReport = asyncHandler(async (req, res) => {
  const stats = await Sale.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$saleDate" },
          month: { $month: "$saleDate" },
        },
        totalSalesValue: { $sum: "$salePrice" },
        numberOfSales: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": -1, "_id.month": -1 },
    },
  ]);

  res.status(200).json({ success: true, data: stats });
});
