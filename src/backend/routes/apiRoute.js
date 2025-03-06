const express = require("express");
const router = express.Router();
const upload = require("../config/uploadConfig");
const AmenityController = require("../controllers/AmenityController");
const UtilityController = require("../controllers/UtilityController");
const RoomController = require("../controllers/RoomController");

router.get("/amenities", AmenityController.getAllAmenities);
router.get("/amenity/:id", AmenityController.getAmenityById);
router.get("/amenity/image/:id", AmenityController.getAmenityImageById);
router.patch(
  "/amenity/:id/images",
  upload.array("images", 5),
  AmenityController.addImagesToAmenity
);
router.delete(
  "/amenity/:id/images",
  AmenityController.deleteImagesForAmenity
);
router.post(
  "/amenity",
  upload.array("images", 5),
  AmenityController.addNewAmenity
);
router.put("/amenity/:id", AmenityController.updateAmenity);
router.delete("/amenity/:id", AmenityController.deleteAmenity);

// ___________________________________________________________________________________________________

// utility routes
router.get("/utilities", UtilityController.getAllUtilities);
router.get("/utility/:id", UtilityController.getUtilityById);
router.get("/utility/image/:id", UtilityController.getUtilityImageById);
router.patch(
  "/utility/:id/images",
  upload.array("images", 5),
  UtilityController.addImagesToUtility
);
router.delete(
  "/utility/:id/images",
  UtilityController.deleteImagesForUtility
);
router.post(
  "/utility",
  upload.array("images", 5),
  UtilityController.addNewUtility
);
router.put("/utility/:id", UtilityController.updateUtility);
router.delete("/utility/:id", UtilityController.deleteUtility);

// ___________________________________________________________________________________________________

// room routes
router.get("/rooms", RoomController.getAllRooms);
router.get("/room/:id", RoomController.getRoomById);
router.get("/room/image/:id", RoomController.getRoomImageById);
router.patch(
  "/room/:id/images",
  upload.array("images", 5),
  RoomController.addImagesToRoom
);
router.delete("/room/:id/images", RoomController.deleteImagesForRoom);
router.patch("/room/:id/amenities", RoomController.addAmenitiesToRoom);
router.delete("/room/:id/amenities", RoomController.deleteAmenitiesForRoom);
router.patch("/room/:id/utilities", RoomController.addUtilitiesToRoom);
router.delete("/room/:id/utilities", RoomController.deleteUtilitiesForRoom);
router.post("/room", upload.array("images", 5), RoomController.addNewRoom);
router.put("/room/:id", RoomController.updateRoom);
router.delete("/room/:id", RoomController.deleteRoom);

module.exports = router;
