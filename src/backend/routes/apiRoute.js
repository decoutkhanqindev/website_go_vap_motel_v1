const express = require("express");
const router = express.Router();
const upload = require("../config/uploadConfig");
const AmenityController = require("../controllers/AmenityController");
const UtilityController = require("../controllers/UtilityController");
const RoomController = require("../controllers/RoomController");

// amenity routes
router.get("/amenities", AmenityController.getAllAmenities);
router.get("/amenity/:id", AmenityController.getAmenityById);
router.post(
  "/amenity",
  upload.array("images", 5),
  AmenityController.addNewAmenity
);
router.put("/amenity/:id", AmenityController.updateAmenity);
router.delete("/amenity/:id", AmenityController.deleteAmenity);
// amenity image routes
router.get("/amenity/image/:id", AmenityController.getAmenityImageById);
router.put(
  "/amenity/:id/images",
  upload.array("images", 5),
  AmenityController.addImagesToAmenity
);
router.put(
  "/amenity/:id/image/:imageId",
  AmenityController.deleteImageForAmenity
);

// ___________________________________________________________________________________________________

// utility routes
router.get("/utilities", UtilityController.getAllUtilities);
router.get("/utility/:id", UtilityController.getUtilityById);
router.post(
  "/utility",
  upload.array("images", 5),
  UtilityController.addNewUtility
);
router.put("/utility/:id", UtilityController.updateUtility);
router.delete("/utility/:id", UtilityController.deleteUtility);
// utility image routes
router.get("/utility/image/:id", UtilityController.getUtilityImageById);
router.put(
  "/utility/:id/images",
  upload.array("images", 5),
  UtilityController.addImagesToUtility
);
router.put(
  "/utility/:id/image/:imageId",
  UtilityController.deleteImageForUtility
);

// ___________________________________________________________________________________________________

// room routes
router.get("/rooms", RoomController.getAllRooms);
router.get("/room/:id", RoomController.getRoomById);
router.post("/room", upload.array("images", 5), RoomController.addNewRoom);

module.exports = router;
