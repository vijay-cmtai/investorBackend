const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const propertyStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    return {
      folder: "properties",
      resource_type: "auto", 
      allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4", "mov", "avi"],
    };
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
