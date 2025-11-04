const express = require("express");
const {
  getRolesAndPermissions,
  updateRolePermissions,
  initializeDefaultRoles, 
} = require("../controllers/roleController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorize("Admin"));

router.route("/").get(getRolesAndPermissions);
router.route("/initialize").post(initializeDefaultRoles);
router.route("/:id").put(updateRolePermissions);

module.exports = router;
