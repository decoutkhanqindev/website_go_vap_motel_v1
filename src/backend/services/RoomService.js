const logger = require("../utils/logger");
const ApiError = require("../utils/ApiError");
const Room = require("../models/Room");
const RoomImage = require("../models/RoomImage");

class RoomService {
  static async getAllRooms(filter) {
    try {
      logger.info(`RoomService.getAllRooms() is called.`);
      let query = Room.find();

      if (filter.roomNumber)
        query = query.where("roomNumber").equals(filter.roomNumber);
      if (filter.status) query = query.where("status").equals(filter.status);
      if (filter.address) query = query.where("address").equals(filter.address);
      if (
        filter.minRentPrice !== undefined &&
        filter.maxRentPrice !== undefined
      ) {
        query = query
          .where("rentPrice")
          .gte(filter.minRentPrice)
          .lte(filter.maxRentPrice);
      }
      if (filter.area) query = query.where("area").equals(filter.area);
      if (
        filter.minOccupantsNumber !== undefined &&
        filter.maxOccupantsNumber !== undefined
      ) {
        query = query
          .where("occupantsNumber")
          .gte(filter.minOccupantsNumber)
          .lte(filter.maxOccupantsNumber);
      }

      const rooms = await query;
      if (!rooms.length) {
        throw new ApiError(404, `No rooms found matching your filter.`);
      }
      return rooms;
    } catch (error) {
      logger.error(`RoomService.getAllRooms()  have error:\n${error}`);
      throw error;
    }
  }

  static async getRoomById(id) {
    try {
      logger.info("RoomService.getRoomById() is called.");
      const room = await Room.findById(id);
      if (!room) {
        throw new ApiError(404, `Not room found matching id ${id}.`);
      }
      return room;
    } catch (error) {
      logger.error(`RoomService.getRoomById() have error:\n${error}`);
      throw error;
    }
  }

  static async isExsits(roomNumber, address) {
    try {
      logger.info("RoomService.isExsits() is called.");
      const room = await Room.findOne({
        roomNumber: roomNumber,
        address: address
      });
      if (room) return true;
      return false;
    } catch (error) {
      logger.error(`RoomService.isExsits() have error:\n${error}`);
      throw error;
    }
  }
  static async getRoomImageById(id) {
    try {
      logger.info(`RoomService.getRoomImageById() is called.`);
      const roomImage = await RoomImage.findById(id);
      if (!roomImage) {
        throw new ApiError(404, `No room image found matching id ${id}.`);
      }
      return roomImage;
    } catch (error) {
      logger.error(`RoomService.getRoomImageById()  have error:\n${error}`);
      throw error;
    }
  }

  static async addNewRoomImage(data) {
    try {
      logger.info("RoomService.addNewRoomImage() is called.");
      const newRoomImage = new RoomImage(data);
      const addedRoomImage = await newRoomImage.save();
      if (!addedRoomImage) {
        throw new ApiError(400, "Can not add new room image.");
      }
      return addedRoomImage;
    } catch (error) {
      logger.error(`RoomService.addNewRoomImage() have error:\n${error}`);
      throw error;
    }
  }

  static async deleteRoomImage(id) {
    try {
      logger.info("RoomService.deleteRoomImage() is called.");
      const deletedRoomImage = await RoomImage.findByIdAndDelete(id);
      if (!deletedRoomImage) {
        throw new ApiError(400, `Can not delete room image matching ${id}.`);
      }
      return deletedRoomImage;
    } catch (error) {
      logger.error(`RoomService.deleteRoomImage() have error:\n${error}`);
      throw error;
    }
  }

  static async addImagesToRoom(id, imageFiles) {
    try {
      logger.info("RoomService.addImagesToRoom() is called.");
      let newImages = [];
      for (const file of imageFiles) {
        const data = {
          roomId: id,
          data: file.buffer,
          contentType: file.mimetype
        };
        const addedRoomImage = await RoomService.addNewRoomImage(data);
        newImages.push(addedRoomImage._id);
      }

      const updatedRoom = await Room.findByIdAndUpdate(
        id,
        {
          $push: { images: { $each: newImages } }
        },
        { new: true }
      );
      if (!updatedRoom) {
        throw new ApiError(400, `Can not add images for room with id ${id}.`);
      }
      return updatedRoom;
    } catch (error) {
      logger.error(`RoomService.addImagesToRoom() have error:\n${error}`);
      throw error;
    }
  }

  static async deleteImagesForRoom(id, imageIds) {
    try {
      logger.info("RoomService.deleteImagesForRoom() is called.");
      const updatedRoom = await Room.findByIdAndUpdate(
        id,
        {
          $pull: { images: { $in: imageIds } }
        },
        { new: true }
      );

      if (!updatedRoom) {
        throw new ApiError(
          400,
          `Can not delete images for room with id ${id}.`
        );
      }

      for (const imageId of imageIds) {
        await RoomService.deleteRoomImage(imageId);
      }

      return updatedRoom;
    } catch (error) {
      logger.error(`RoomService.deleteImagesForRoom() have error:\n${error}`);
      throw error;
    }
  }

  static async addAmenitiesToRoom(id, amenityIds) {
    try {
      logger.info("RoomService.addAmenitiesToRoom() is called.");
      const updatedRoom = await Room.findByIdAndUpdate(
        id,
        {
          $addToSet: { amenities: { $each: amenityIds } }
        },
        { new: true }
      );
      if (!updatedRoom) {
        throw new ApiError(
          400,
          `Can not add amenities for room with id ${id}.`
        );
      }
      return updatedRoom;
    } catch (error) {
      logger.error(`RoomService.addAmenitiesToRoom() have error:\n${error}`);
      throw error;
    }
  }

  static async deleteAmenitiesForRoom(id, amenityIds) {
    try {
      logger.info("RoomService.deleteAmenitiesForRoom() is called.");
      const updatedRoom = await Room.findByIdAndUpdate(
        id,
        {
          $pull: { amenities: { $in: amenityIds } }
        },
        { new: true }
      );
      if (!updatedRoom) {
        throw new ApiError(
          400,
          `Can not delete amenities for room with id ${id}.`
        );
      }
      return updatedRoom;
    } catch (error) {
      logger.error(
        `RoomService.deleteAmenitiesForRoom() have error:\n${error}`
      );
      throw error;
    }
  }

  static async addUtilitiesToRoom(id, utilityIds) {
    try {
      logger.info("RoomService.addUtilitiesToRoom() is called.");
      const updatedRoom = await Room.findByIdAndUpdate(
        id,
        {
          $addToSet: { utilities: { $each: utilityIds } }
        },
        { new: true }
      );
      if (!updatedRoom) {
        throw new ApiError(
          400,
          `Can not add utilities for room with id ${id}.`
        );
      }
      return updatedRoom;
    } catch (error) {
      logger.error(`RoomService.addUtilitiesToRoom() have error:\n${error}`);
      throw error;
    }
  }

  static async deleteUtilitiesForRoom(id, utilityIds) {
    try {
      logger.info("RoomService.deleteUtilitiesForRoom() is called.");
      const updatedRoom = await Room.findByIdAndUpdate(
        id,
        {
          $pull: { utilities: { $in: utilityIds } }
        },
        { new: true }
      );
      if (!updatedRoom) {
        throw new ApiError(
          400,
          `Can not delete utilities for room with id ${id}.`
        );
      }
      return updatedRoom;
    } catch (error) {
      logger.error(
        `RoomService.deleteUtilitiesForRoom() have error:\n${error}`
      );
      throw error;
    }
  }

  static async addNewRoom(data, imageFiles) {
    try {
      logger.info("RoomService.addNewRoom() is called.");
      const { roomNumber, address } = data;

      const isExits = await RoomService.isExsits(roomNumber, address);
      if (isExits) throw new ApiError(409, "This room already exists.");

      let newRoom = new Room(data);
      const addedRoom = await newRoom.save();
      if (!addedRoom) {
        throw new ApiError(400, `Can not add new room.`);
      }

      if (imageFiles && Array.isArray(imageFiles) && imageFiles.length > 0) {
        newRoom = await RoomService.addImagesToRoom(newRoom._id, imageFiles);
      }

      const updatedRoom = await RoomService.getRoomById(addedRoom._id);
      return updatedRoom;
    } catch (error) {
      logger.error(`RoomService.addNewRoom() have error:\n${error}`);
      throw error;
    }
  }

  static async updateRoom(id, data) {
    try {
      logger.info("RoomService.updateRoom() is called.");
      const updatedRoom = await Room.findByIdAndUpdate(id, data, {
        new: true
      });
      if (!updatedRoom) {
        throw new ApiError(400, `Can not update room with id ${id}.`);
      }
      return updatedRoom;
    } catch (error) {
      logger.error(`RoomService.updateAmenity() have error:\n${error}`);
      throw error;
    }
  }

  static async deleteRoom(id) {
    try {
      logger.info("RoomService.updateRoom() is called.");
      const deletedRoom = await Room.findByIdAndDelete(id);
      if (!deletedRoom) {
        throw new ApiError(400, `Can not delete room with id ${id}..`);
      }

      let copyRoomImages = [...deletedRoom.images];
      if (copyRoomImages.length > 0) {
        for (const imageId of copyRoomImages) {
          await RoomService.deleteRoomImage(imageId);
        }
      }

      return deletedRoom;
    } catch (error) {
      logger.error(`RoomService.deleteRoom() have error:\n${error}`);
      throw error;
    }
  }
}

module.exports = RoomService;
