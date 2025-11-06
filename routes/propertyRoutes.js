const express = require("express");
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  approveProperty,
  toggleHotDeal,
  toggleFeatured,
  toggleVerified,
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
  uploadProperties.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 2 }, 
  ]),
  createProperty
);

router
  .route("/:id")
  .get(getProperty)
  .put(
    protect,
    authorize("Admin", "Company", "Associate"),
    uploadProperties.fields([
      { name: "images", maxCount: 10 },
      { name: "videos", maxCount: 2 },
    ]),
    updateProperty
  )
  .delete(protect, authorize("Admin", "Company", "Associate"), deleteProperty);

router.route("/:id/approve").put(protect, authorize("Admin"), approveProperty);
router
  .route("/:id/toggle-hotdeal")
  .put(protect, authorize("Admin"), toggleHotDeal);
router
  .route("/:id/toggle-featured")
  .put(protect, authorize("Admin"), toggleFeatured);
router
  .route("/:id/toggle-verified")
  .put(protect, authorize("Admin"), toggleVerified);

module.exports = router;
