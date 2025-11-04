// /controllers/dashboardController.js

const Property = require("../models/PropertyModel"); // Adjust path to your model
const Sale = require("../models/SaleModel"); // Adjust path to your model
const Lead = require("../models/inquiryModel"); // Adjust path to your model

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (add auth middleware later)
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 1. Get total number of properties
    const totalProperties = await Property.countDocuments();

    // 2. Get total sales value for the current month
    const monthlySales = await Sale.aggregate([
      { $match: { saleDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: "$salePrice" } } },
    ]);

    // 3. Get new leads for the current month
    const newLeadsCount = await Lead.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // 4. Get total sales count (can be used for "Reports Generated")
    const totalSalesCount = await Sale.countDocuments();

    res.status(200).json({
      totalProperties,
      totalSalesMonth: monthlySales.length > 0 ? monthlySales[0].total : 0,
      newLeadsMonth: newLeadsCount,
      reportsGenerated: totalSalesCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get recent properties
// @route   GET /api/dashboard/recent-properties
// @access  Private
const getRecentProperties = async (req, res) => {
  try {
    const properties = await Property.find({})
      .sort({ createdAt: -1 }) // Get the newest first
      .limit(5); // Limit to 5 results
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get recent leads
// @route   GET /api/dashboard/recent-leads
// @access  Private
const getRecentLeads = async (req, res) => {
  try {
    const leads = await Lead.find({})
      .populate("property", "title") // Get property title
      .sort({ createdAt: -1 })
      .limit(5);
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getDashboardStats,
  getRecentProperties,
  getRecentLeads,
};
