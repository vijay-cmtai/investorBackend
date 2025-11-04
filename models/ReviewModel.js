const mongoose = require("mongoose");
const Property = require("./PropertyModel");

const ReviewSchema = new mongoose.Schema(
  {
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true, maxlength: 500 },
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    property: {
      type: mongoose.Schema.ObjectId,
      ref: "Property",
      required: true,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ property: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAverageRating = async function (propertyId) {
  const stats = await this.aggregate([
    { $match: { property: propertyId } },
    {
      $group: {
        _id: "$property",
        numReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await Property.findByIdAndUpdate(propertyId, {
        numReviews: stats[0].numReviews,
        averageRating: stats[0].averageRating.toFixed(1),
      });
    } else {
      await Property.findByIdAndUpdate(propertyId, {
        numReviews: 0,
        averageRating: 0,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

ReviewSchema.post("save", function () {
  this.constructor.calculateAverageRating(this.property);
});

ReviewSchema.pre("deleteOne", { document: true, query: false }, function () {
  this.constructor.calculateAverageRating(this.property);
});

module.exports = mongoose.model("Review", ReviewSchema);
