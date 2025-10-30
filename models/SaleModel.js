const mongoose = require("mongoose");

const saleSchema = mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    buyer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    sellerAssociate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    salePrice: {
      type: Number,
      required: true,
    },
    commissionPercentage: {
      type: Number,
      required: true,
      default: 2,
    },
    totalCommissionAmount: {
      type: Number,
      required: true,
    },
    saleDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);
