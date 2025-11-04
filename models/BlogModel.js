const mongoose = require("mongoose");
const slugify = require("slugify");

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      unique: true,
      trim: true,
    },
    slug: String,
    content: {
      type: String,
      required: [true, "Please add content"],
    },
    excerpt: {
      type: String,
      required: [true, "Please add an excerpt"],
      maxlength: [200, "Excerpt cannot be more than 200 characters"],
    },
    imageUrl: {
      type: String,
      required: [true, "Please add an image URL"],
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Published",
    },
  },
  { timestamps: true }
);

BlogSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model("Blog", BlogSchema);
