const mongoose = require("mongoose");

const leadSchema = mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    message: { type: String },
    status: {
      type: String,
      enum: [
        "New",
        "Allocated",
        "Contacted",
        "Follow-up",
        "Converted",
        "Dropped",
      ],
      default: "New",
    },
    source: {
      type: String,
      default: "Platform",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
