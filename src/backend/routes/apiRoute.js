const express = require("express");
const router = express.Router();
const upload = require("../config/uploadConfig");
const AmenityController = require("../controllers/AmenityController");
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
router.get("/amenity/image/:id", AmenityController.getAmenityImageById);
router.post(
  "/amenity/:id/images",
  upload.array("images", 5),
  AmenityController.addImagesToAmenity
);
router.delete(
  "/amenity/:id/image/:imagesId",
  AmenityController.deleteImagesToAmenity
);

// room routes
router.get("/rooms", RoomController.getAllRooms);
router.get("/room/:id", RoomController.getRoomById);
router.post("/room", upload.array("images", 5), RoomController.addNewRoom);

module.exports = router;
