const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const propertyStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "properties",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profiles",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const uploadProperties = multer({ storage: propertyStorage });
const uploadProfile = multer({ storage: profileStorage });

module.exports = { uploadProperties, uploadProfile };
