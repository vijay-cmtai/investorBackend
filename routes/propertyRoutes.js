const express = require("express");
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  approveProperty,
} = require("../controllers/propertyController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { uploadProperties } = require("../middlewares/uploadMiddleware");
const reviewRouter = require("./reviewRoutes");

const router = express.Router();

router.use("/:id/reviews", reviewRouter);

router.get("/", getProperties);

router.post(
  "/",
  protect,
  authorize("Admin", "Company", "Associate"),
  uploadProperties.array("images", 10),
  createProperty
);

router
  .route("/:id")
  .get(getProperty)
  .put(
    protect,
    authorize("Admin", "Company", "Associate"),
    uploadProperties.array("images", 10),
    updateProperty
  )
  .delete(protect, authorize("Admin", "Company", "Associate"), deleteProperty);

router.route("/:id/approve").put(protect, authorize("Admin"), approveProperty);

module.exports = router;
