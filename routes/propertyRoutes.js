// /routes/propertyRoutes.js

const express = require("express");
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
  approveProperty,
} = require("../controllers/propertyController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();

router
  .route("/")
  .get(getProperties)
  .post(
    protect,
    authorize("Associate", "Company", "Admin"),
    upload.array("images", 10),
    createProperty
  );

router.get(
  "/my-properties",
  protect,
  authorize("Associate", "Company"),
  getMyProperties
);

router
  .route("/:id")
  .get(getProperty)
  .put(
    protect,
    authorize("Associate", "Company", "Admin"),
    upload.array("images", 10),
    updateProperty
  )
  .delete(protect, authorize("Associate", "Company", "Admin"), deleteProperty);

router.route("/:id/approve").put(protect, authorize("Admin"), approveProperty);

module.exports = router;
