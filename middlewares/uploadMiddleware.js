const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/s3");

const bucket = process.env.AWS_S3_BUCKET_NAME;

const uploadProperties = multer({
  storage: multerS3({
    s3,
    bucket,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(null, `properties/${Date.now()}-${file.originalname}`);
    },
  }),
});
const uploadProfile = multer({
  storage: multerS3({
    s3,
    bucket,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(null, `profiles/${Date.now()}-${file.originalname}`);
    },
  }),
});

module.exports = { uploadProperties, uploadProfile };
