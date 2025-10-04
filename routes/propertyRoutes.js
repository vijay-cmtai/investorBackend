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
    authorize("admin", "broker", "user"),
    upload.array("images", 10),
    createProperty
  );

router.get(
  "/my-properties",
  protect,
  authorize("broker", "user"),
  getMyProperties
);

router
  .route("/:id")
  .get(getProperty)
  .put(
    protect,
    authorize("admin", "broker", "user"), 
    upload.array("images", 10),
    updateProperty
  )
  .delete(
    protect,
    authorize("admin", "broker", "user"), 
    deleteProperty
  );

router.route("/:id/approve").put(protect, authorize("admin"), approveProperty);

module.exports = router;
