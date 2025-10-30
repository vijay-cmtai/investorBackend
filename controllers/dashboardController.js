const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
const Property = require("../models/PropertyModel");
const Lead = require("../models/LeadModel");
const Sale = require("../models/SaleModel");
const Commission = require("../models/CommissionModel");

exports.getDashboardData = asyncHandler(async (req, res) => {
  const user = req.user;
  let data = {};

  if (user.role === "Admin") {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      totalUsers,
      totalProperties,
      activeLeads,
      totalSales,
      monthlyRevenue,
      recentSales,
    ] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Lead.countDocuments({ status: { $ne: "Converted" } }),
      Sale.aggregate([
        { $group: { _id: null, total: { $sum: "$salePrice" } } },
      ]),
      Sale.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            total: { $sum: "$salePrice" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Sale.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("property", "title")
        .populate("sellerAssociate", "name"),
    ]);

    data = {
      totalUsers,
      totalProperties,
      activeLeads,
      totalSalesValue: totalSales[0]?.total || 0,
      monthlyRevenue,
      recentSales,
    };
  } else if (user.role === "Company") {
    // Company logic yahan aayega
    const associates = await User.find({ company: user._id });
    const associateIds = associates.map((a) => a._id);
    const [totalAssociates, companyLeads, companySales] = await Promise.all([
      User.countDocuments({ company: user._id }),
      Lead.countDocuments({ assignedTo: { $in: associateIds } }),
      Sale.countDocuments({ sellerAssociate: { $in: associateIds } }),
    ]);
    data = { totalAssociates, companyLeads, companySales };
  } else if (user.role === "Associate" || user.role === "Broker") {
    // Associate/Broker logic yahan aayega
    const [myLeads, mySales, myCommission, downlineCount] = await Promise.all([
      Lead.countDocuments({ assignedTo: user._id }),
      Sale.countDocuments({ sellerAssociate: user._id }),
      Commission.aggregate([
        { $match: { user: user._id } },
        { $group: { _id: "$status", total: { $sum: "$amount" } } },
      ]),
      User.countDocuments({ referredBy: user._id }),
    ]);
    const commissions = myCommission.reduce((acc, curr) => {
      acc[curr._id] = curr.total;
      return acc;
    }, {});
    data = { myLeads, mySales, commissions, downlineCount };
  } else {
    // Customer logic
    data = { message: "Welcome to your dashboard" };
  }

  res.status(200).json({ success: true, data });
});
