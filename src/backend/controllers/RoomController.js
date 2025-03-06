const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const RoomService = require("../services/RoomService");
const { default: mongoose } = require("mongoose");

class RoomController {
  static async getAllRooms(req, res, next) {
    try {
      logger.info("RoomController.getAllRooms() is called.");
      const query = req.query;
      const filter = {};

      if (query.roomNumber) filter.roomNumber = query.roomNumber;
      if (query.status) filter.status = query.status;
      if (query.address) filter.address = query.address;
      if (query.minRentPrice && query.maxRentPrice) {
        filter.minRentPrice = query.minRentPrice;
        filter.maxRentPrice = query.maxRentPrice;
      }
      if (query.area) filter.area = query.area;
      if (query.minOccupantsNumber && query.maxOccupantsNumber) {
        filter.minOccupantsNumber = query.minOccupantsNumber;
        filter.maxOccupantsNumber = query.maxOccupantsNumber;
      }

      const rooms = await RoomService.getAllRooms(filter);
      res.status(200).json(rooms);
    } catch (error) {
      logger.info(`RoomController.getAllRooms() have error:\n${error}`);
      next(error);
    }
  }

  static async getRoomById(req, res, next) {
    try {
      logger.info("RoomController.getRoomById() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param must be provided."));
      }
      const room = await RoomService.getRoomById(id);
      res.status(200).json(room);
    } catch (error) {
      logger.info(`RoomController.getRoomById() have error:\n${error}`);
      next(error);
    }
  }

  static async getRoomImageById(req, res, next) {
    try {
      logger.info("RoomController.getRoomImageById() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param must be provided."));
      }
      const roomImage = await RoomService.getRoomImageById(id);
      res.status(200).json(roomImage);
    } catch (error) {
      logger.error(`RoomController.getRoomImageById() have error:\n${error}`);
      next(error);
    }
  }

  static async addImagesToRoom(req, res, next) {
    try {
      logger.info("RoomController.addImagesToRoom() is called.");
      const id = req.params.id;
      const imageFiles = req.files;

      if (!id) {
        return next(new ApiError(400, "Param must be provided."));
      }

      if (imageFiles && imageFiles.length === 0) {
        return next(new ApiError(400, "At least one image must be added."));
      }

      const updatedRoom = await RoomService.addImagesToRoom(id, imageFiles);
      res.status(201).json(updatedRoom);
    } catch (error) {
      logger.error(`RoomController.addImagesToRoom() have error:\n${error}`);
      next(error);
    }
  }

  static async deleteImagesForRoom(req, res, next) {
    try {
      logger.info("RoomController.deleteImagesForRoom() is called.");
      const id = req.params.id;
      const imageIds = req.body.images;

      if (!id) {
        return next(new ApiError(400, "Params must be provided."));
      }

      if (imageIds && imageIds.length === 0) {
        return next(new ApiError(400, "At least one image must be deleted."));
      }

      const updatedRoom = await RoomService.deleteImagesForRoom(id, imageIds);
      res.status(201).json(updatedRoom);
    } catch (error) {
      logger.error(
        `RoomController.deleteImagesForRoom() have error:\n${error}`
      );
      next(error);
    }
  }

  static async addAmenitiesToRoom(req, res, next) {
    try {
      logger.info("RoomController.addAmenitiesToRoom() is called.");
      const id = req.params.id;
      const amenityIds = req.body.amenities;

      if (!id) {
        return next(new ApiError(400, "Param must be provided."));
      }

      if (amenityIds && amenityIds.length === 0) {
        return next(new ApiError(400, "At least one amenity must be added."));
      }

      const updatedRoom = await RoomService.addAmenitiesToRoom(id, amenityIds);
      res.status(201).json(updatedRoom);
    } catch (error) {
      logger.error(`RoomController.addAmenitiesToRoom() have error:\n${error}`);
      next(error);
    }
  }

  static async deleteAmenitiesForRoom(req, res, next) {
    try {
      logger.info("RoomController.deleteAmenitiesForRoom() is called.");
      const id = req.params.id;
      const amenityIds = req.body.amenities;

      if (!id) {
        return next(new ApiError(400, "Params must be provided."));
      }

      if (amenityIds && amenityIds.length === 0) {
        return next(new ApiError(400, "At least one amenity must be deleted."));
      }

      const updatedRoom = await RoomService.deleteAmenitiesForRoom(
        id,
        amenityIds
      );
      res.status(201).json(updatedRoom);
    } catch (error) {
      logger.error(
        `RoomController.deleteAmenitiesForRoom() have error:\n${error}`
      );
      next(error);
    }
  }

  static async addUtilitiesToRoom(req, res, next) {
    try {
      logger.info("RoomController.addUtilitiesToRoom() is called.");
      const id = req.params.id;
      const utilityIds = req.body.utilities;

      if (!id) {
        return next(new ApiError(400, "Param must be provided."));
      }

      if (utilityIds && utilityIds.length === 0) {
        return next(new ApiError(400, "At least one utility must be added."));
      }

      const updatedRoom = await RoomService.addUtilitiesToRoom(id, utilityIds);
      res.status(201).json(updatedRoom);
    } catch (error) {
      logger.error(`RoomController.addUtilitiesToRoom() have error:\n${error}`);
      next(error);
    }
  }

  static async deleteUtilitiesForRoom(req, res, next) {
    try {
      logger.info("RoomController.deleteUtilitiesForRoom() is called.");
      const id = req.params.id;
      const utilityIds = req.body.utilities;

      if (!id) {
        return next(new ApiError(400, "Params must be provided."));
      }

      if (utilityIds && utilityIds.length === 0) {
        return next(new ApiError(400, "At least one amenity must be deleted."));
      }

      const updatedRoom = await RoomService.deleteUtilitiesForRoom(
        id,
        utilityIds
      );
      res.status(201).json(updatedRoom);
    } catch (error) {
      logger.error(
        `RoomController.deleteUtilityForRoom() have error:\n${error}`
      );
      next(error);
    }
  }

  static async addNewRoom(req, res, next) {
    try {
      logger.info("RoomController.addNewRoom() is called.");
      const data = req.body;
      const imageFiles = req.files;

      if (
        !data.roomNumber ||
        !data.status ||
        !data.address ||
        !data.rentPrice ||
        !data.occupantsNumber
      ) {
        return next(new ApiError(400, "No form data found."));
      }

      const addedRoom = await RoomService.addNewRoom(data, imageFiles);
      res.status(201).json(addedRoom);
    } catch (error) {
      logger.error(`RoomController.addNewRoom() have error:\n${error}`);
      next(error);
    }
  }

  static async updateRoom(req, res, next) {
    try {
      logger.info("RoomController.updateRoom() is called.");
      const id = req.params.id;
      const data = req.body;

      if (!id) {
        return next(new ApiError(400, "Param must be provided."));
      }

      if (
        !data.roomNumber &&
        !data.status &&
        !data.address &&
        !data.rentPrice &&
        !data.occupantsNumber
      ) {
        return next(new ApiError(400, "At least one field must be updated."));
      }

      const updatedRoom = await RoomService.updateRoom(id, data);
      res.status(200).json(updatedRoom);
    } catch (error) {
      logger.error(`RoomController.updateRoom() have error:\n${error}`);
      next(error);
    }
  }

  static async deleteRoom(req, res, next) {
    try {
      logger.info("RoomController.deleteRoom() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param must be provided."));
      }
      const deletedRoom = await RoomService.deleteRoom(id);
      res.status(200).json(deletedRoom);
    } catch (error) {
      logger.error(`RoomController.deleteRoom() have error:\n${error}`);
      next(error);
    }
  }
}

module.exports = RoomController;
