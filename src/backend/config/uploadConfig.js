const multer = require("multer");
const ApiError = require("../utils/ApiError");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // max 5 files per upload
  },
  fileFilter: (req, file, cb) => {
    // allowed image MIME types
    const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg"];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // accept file
    } else {
      cb(
        new ApiError(
          "Invalid file type. Only PNG and JPEG images are allowed."
        ),
        false
      ); // reject file
    }
  }
});

module.exports = upload;
