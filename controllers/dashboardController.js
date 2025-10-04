const User = require("../models/UserModel");
const Property = require("../models/PropertyModel");
const Inquiry = require("../models/inquiryModel");
const asyncHandler = require("express-async-handler");

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProperties,
    totalInquiries,
    pendingProperties,
    usersByRole,
    inquiriesByStatus,
  ] = await Promise.all([
    User.countDocuments(),
    Property.countDocuments(),
    Inquiry.countDocuments(),
    Property.countDocuments({ status: "Pending" }),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    Inquiry.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const userRoles = usersByRole.reduce((acc, role) => {
    acc[role._id] = role.count;
    return acc;
  }, {});

  const inquiryStatuses = inquiriesByStatus.reduce((acc, status) => {
    acc[status._id] = status.count;
    return acc;
  }, {});

  // फाइनल आँकड़े भेजें
  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalProperties,
      totalInquiries,
      pendingPropertiesCount: pendingProperties,
      users: {
        total: totalUsers,
        roles: userRoles,
      },
      properties: {
        total: totalProperties,
        pending: pendingProperties,
      },
      inquiries: {
        total: totalInquiries,
        statuses: inquiryStatuses,
      },
    },
  });
});
