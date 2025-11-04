const asyncHandler = require("express-async-handler");
const Property = require("../models/PropertyModel");
const Sale = require("../models/SaleModel");
const User = require("../models/UserModel");
const Lead = require("../models/LeadModel");

const getAdminDashboardStats = asyncHandler(async (req, res) => {
  // 1. Basic Counts
  const totalProperties = await Property.countDocuments({});
  const totalUsers = await User.countDocuments({});
  // Assuming 'active' leads are any that aren't marked 'Closed' or similar
  const activeLeads = await Lead.countDocuments({ status: { $ne: "Closed" } });

  // 2. Sales Value
  const totalSalesData = await Sale.aggregate([
    { $group: { _id: null, total: { $sum: "$salePrice" } } },
  ]);
  const totalSalesValue =
    totalSalesData.length > 0 ? totalSalesData[0].total : 0;

  // 3. Monthly Revenue for Chart
  const now = new Date();
  const oneYearAgo = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate()
  );

  const monthlyRevenue = await Sale.aggregate([
    { $match: { saleDate: { $gte: oneYearAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$saleDate" } },
        total: { $sum: "$salePrice" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 4. Recent Sales for Table
  const recentSales = await Sale.find({})
    .sort({ saleDate: -1 })
    .limit(5)
    .populate("buyer", "name email"); // Fetch buyer's name and email

  res.status(200).json({
    totalProperties,
    totalSalesValue,
    totalUsers,
    activeLeads,
    monthlyRevenue,
    recentSales,
  });
});

// Baaki ke functions waise hi rahenge
const getCompanyDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalProperties = await Property.countDocuments({ user: userId });
  const companyProperties = await Property.find({ user: userId }).select("_id");
  const propertyIds = companyProperties.map((p) => p._id);

  const monthlySales = await Sale.aggregate([
    {
      $match: {
        property: { $in: propertyIds },
        saleDate: { $gte: startOfMonth },
      },
    },
    { $group: { _id: null, total: { $sum: "$salePrice" } } },
  ]);

  const newLeadsCount = await Lead.countDocuments({
    company: userId,
    createdAt: { $gte: startOfMonth },
  });

  const reportsGenerated = await Sale.countDocuments({
    property: { $in: propertyIds },
  });

  res.status(200).json({
    totalProperties,
    totalSalesMonth: monthlySales.length > 0 ? monthlySales[0].total : 0,
    newLeadsMonth: newLeadsCount,
    reportsGenerated,
  });
});

const getRecentProperties = asyncHandler(async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { user: req.user._id };
  const properties = await Property.find(filter)
    .sort({ createdAt: -1 })
    .limit(5);
  res.status(200).json(properties);
});

const getRecentLeads = asyncHandler(async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { company: req.user._id };
  const leads = await Lead.find(filter)
    .populate("property", "title")
    .sort({ createdAt: -1 })
    .limit(5);
  res.status(200).json(leads);
});

module.exports = {
  getAdminDashboardStats,
  getCompanyDashboardStats,
  getRecentProperties,
  getRecentLeads,
};
