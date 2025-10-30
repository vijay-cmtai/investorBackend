const User = require("../models/UserModel");
const Commission = require("../models/CommissionModel");

const COMMISSION_LEVELS = {
  0: 0.5, // 50% for direct seller
  1: 0.1, // 10% for first upline
  2: 0.05, // 5% for second upline
};
const MAX_LEVELS = Object.keys(COMMISSION_LEVELS).length;

async function calculateAndDistributeCommissions(sale) {
  try {
    const sellerId = sale.sellerAssociate;
    const totalCommission = sale.totalCommissionAmount;

    let currentUser = await User.findById(sellerId);
    if (!currentUser) {
      console.error("Seller not found for commission calculation");
      return;
    }

    for (let level = 0; level < MAX_LEVELS; level++) {
      if (!currentUser) break;

      const commissionPercentage = COMMISSION_LEVELS[level];
      if (!commissionPercentage) break;

      const commissionAmount = totalCommission * commissionPercentage;

      await Commission.create({
        sale: sale._id,
        user: currentUser._id,
        amount: commissionAmount,
        level: level,
        status: "Pending",
      });

      if (currentUser.referredBy) {
        currentUser = await User.findById(currentUser.referredBy);
      } else {
        currentUser = null;
      }
    }
  } catch (error) {
    console.error("Error in distributing commissions:", error);
  }
}

module.exports = { calculateAndDistributeCommissions };
