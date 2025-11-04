const Role = require("../models/RoleModel");
const asyncHandler = require("express-async-handler");

// Pehle se मौजूद functions
exports.getRolesAndPermissions = asyncHandler(async (req, res) => {
  const roles = await Role.find({});
  res.status(200).json({ success: true, data: roles });
});

exports.updateRolePermissions = asyncHandler(async (req, res) => {
  const { permissions } = req.body;
  if (!Array.isArray(permissions)) {
    res.status(400);
    throw new Error("Permissions must be an array.");
  }
  const role = await Role.findByIdAndUpdate(
    req.params.id,
    { permissions },
    { new: true, runValidators: true }
  );
  if (!role) {
    res.status(404);
    throw new Error("Role not found");
  }
  res.status(200).json({ success: true, data: role });
});

// --- YEH NAYA FUNCTION ADD KAREIN ---
exports.initializeDefaultRoles = asyncHandler(async (req, res) => {
  const count = await Role.countDocuments();

  if (count > 0) {
    // Agar roles pehle se hain, to kuch na karein
    const existingRoles = await Role.find({});
    return res
      .status(200)
      .json({
        success: true,
        message: "Roles already exist.",
        data: existingRoles,
      });
  }

  // Agar roles nahi hain, to default roles create karein
  const defaultRoles = [
    {
      name: "Admin",
      permissions: [
        "View Dashboard",
        "Manage Properties",
        "Manage Users",
        "Manage Leads",
        "Manage Commissions",
        "Access Reports",
        "Manage Settings",
      ],
    },
    {
      name: "Associate",
      permissions: [
        "View Dashboard",
        "Manage Properties",
        "Manage Leads",
        "Manage Commissions",
      ],
    },
    {
      name: "Company",
      permissions: [
        "View Dashboard",
        "Manage Properties",
        "Manage Leads",
        "Access Reports",
      ],
    },
    { name: "Customer", permissions: [] },
  ];

  const createdRoles = await Role.insertMany(defaultRoles);
  res
    .status(201)
    .json({
      success: true,
      message: "Default roles initialized successfully.",
      data: createdRoles,
    });
});
