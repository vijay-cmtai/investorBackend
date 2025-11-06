const mongoose = require("mongoose");
const PropertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: {
      type: {
        city: { type: String, required: true },
        district: { type: String, required: true },
        area: { type: String, required: true },
        fullAddress: { type: String, required: true },
        pincode: { type: String, required: true },
      },
      required: true,
    },
    property_type: {
      type: String,
      enum: [
        "Residential",
        "Commercial",
        "Agriculture",
        "Industrial",
        "Resale",
        "New Launch",
        "Upcoming",
        "Emergency",
        "Apartment",
        "Villa",
        "Plot",
        "Office",
        "Farmhouse",
        "Builder Floor",
      ],
      required: true,
    },
    transaction_type: {
      type: String,
      enum: ["sale", "rent", "lease"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Sold"],
      default: "Pending",
    },
    images: { type: [String], default: [] },
    bedrooms: { type: Number, required: true, default: 0 },
    bathrooms: { type: Number, required: true, default: 0 },
    square_feet: { type: Number, required: true },
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    commission: {
      type: {
        percentage: { type: Number, default: 2 },
        assignedAssociate: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          default: null,
        },
      },
      default: {},
    },
    isFeatured: { type: Boolean, default: false },
    isHotDeal: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    yearBuilt: { type: Number },
    floor: { type: Number },
    totalFloors: { type: Number },
    parkingSpaces: { type: Number, default: 0 },
    furnishingStatus: {
      type: String,
      enum: ["Furnished", "Semi-Furnished", "Unfurnished"],
      default: "Unfurnished",
    },
    amenities: { type: [String], default: [] },
    availableFrom: { type: Date },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PropertySchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "property",
  justOne: false,
});

module.exports = mongoose.model("Property", PropertySchema);
