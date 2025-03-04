const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Max 5 files per upload
  }
  // fileFilter: (req, file, cb) => {
  //   // Allowed image MIME types
  //   const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg"];

  //   if (allowedMimeTypes.includes(file.mimetype)) {
  //     cb(null, true); // Accept file
  //   } else {
  //     cb(
  //       new Error("Invalid file type. Only PNG and JPEG images are allowed."),
  //       false
  //     ); // Reject file
  //   }
  // }
});

module.exports = upload;
