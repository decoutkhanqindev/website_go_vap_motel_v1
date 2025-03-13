const logger = require("../utils/logger");
const ApiError = require("../utils/ApiError");
const RoomService = require("../services/RoomService");
const Utility = require("../models/Utility");
const UtilityImage = require("../models/UtilityImage");

class UtilityService {
  static async getAllUtilities() {
    try {
      logger.info(`UtilityService.getAllUtilities() is called.`);
      const utilities = await Utility.find();
      if (!utilities.length) {
        throw new ApiError(404, `No utilities found.`);
      }
      return utilities;
    } catch (error) {
      logger.error(`UtilityService.getAllUtilities()  have error:\n${error}`);
      throw error;
    }
  }

  static async getUtilityById(id) {
    try {
      logger.info(`UtilityService.getUtilityById() is called.`);
      const utility = await Utility.findById(id);
      if (!utility) {
        throw new ApiError(404, `No utility found matching id ${id}.`);
      }
      return utility;
    } catch (error) {
      logger.error(`UtilityService.getUtilityById()  have error:\n${error}`);
      throw error;
    }
  }

  static async isExists(name) {
    try {
      logger.info("UtilityService.isExists() is called.");
      const utility = await Utility.findOne({ name: name });
      return !!utility;
    } catch (error) {
      logger.error(`UtilityService.isExists() have error:\n${error}`);
      throw error;
    }
  }

  static async getUtilityImageById(id) {
    try {
      logger.info(`UtilityService.getUtilityImageById() is called.`);
      const utilityImage = await UtilityImage.findById(id);
      if (!utilityImage) {
        throw new ApiError(404, `No utility image found matching id ${id}.`);
      }
      return utilityImage;
    } catch (error) {
      logger.error(
        `UtilityService.getUtilityImageById()  have error:\n${error}`
      );
      throw error;
    }
  }

  static async addNewUtilityImage(data) {
    try {
      logger.info("UtilityService.addNewUtilityImage() is called.");
      const newUtilityImage = new UtilityImage(data);
      const addedUtilityImage = await newUtilityImage.save();
      return addedUtilityImage;
    } catch (error) {
      logger.error(`UtilityService.addNewUtilityImage() have error:\n${error}`);
      throw error;
    }
  }

  static async deleteUtilityImage(id) {
    try {
      logger.info("UtilityService.deleteUtilityImage() is called.");
      const deletedUtilityImage = await UtilityImage.findByIdAndDelete(id);
      if (!deletedUtilityImage) {
        throw new ApiError(404, `No utility image found matching id ${id}.`);
      }
      return deletedUtilityImage;
    } catch (error) {
      logger.error(`UtilityService.deleteUtilityImage() have error:\n${error}`);
      throw error;
    }
  }

  static async addImagesToUtility(id, imageFiles) {
    try {
      logger.info("UtilityService.addImagesToUtility() is called.");
      const utility = await Utility.findById(id);
      if (!utility) {
        throw new ApiError(404, `No utility found matching id ${id}.`);
      }

      let newImages = [];
      for (const file of imageFiles) {
        const data = {
          utilityId: id,
          data: file.buffer,
          contentType: file.mimetype
        };
        const addedUtilityImage = await UtilityService.addNewUtilityImage(data);
        newImages.push(addedUtilityImage._id);
      }

      const updatedUtility = await Utility.findByIdAndUpdate(
        id,
        {
          $push: { images: { $each: newImages } }
        },
        { new: true }
      );
      if (!updatedUtility) {
        throw new ApiError(404, `No utility found matching id ${id}.`);
      }
      return updatedUtility;
    } catch (error) {
      logger.error(`UtilityService.addImagesToUtility() have error:\n${error}`);
      throw error;
    }
  }

  static async deleteImagesForUtility(id, imageIds) {
    try {
      logger.info("UtilityService.deleteImagesForUtility() is called.");
      const updatedUtility = await Utility.findByIdAndUpdate(
        id,
        {
          $pull: { images: { $in: imageIds } }
        },
        { new: true }
      );

      if (!updatedUtility) {
        throw new ApiError(404, `No utility images found matching id ${id}.`);
      }

      for (const imageId of imageIds) {
        await UtilityService.deleteUtilityImage(imageId);
      }

      return updatedUtility;
    } catch (error) {
      logger.error(
        `UtilityService.deleteImagesForUtility() have error:\n${error}`
      );
      throw error;
    }
  }
  static async addNewUtility(data, imageFiles) {
    try {
      logger.info("UtilityService.addNewUtility() is called.");
      const { name } = data;

      const isExits = await UtilityService.isExists(name);
      if (isExits) throw new ApiError(409, "This utility already exists.");

      let newUtility = new Utility(data);
      const addedUtility = await newUtility.save();

      if (imageFiles && Array.isArray(imageFiles) && imageFiles.length > 0) {
        newUtility = await UtilityService.addImagesToUtility(
          newUtility._id,
          imageFiles
        );
      }

      const updatedUtility = await UtilityService.getUtilityById(
        addedUtility._id
      );
      return updatedUtility;
    } catch (error) {
      logger.error(`UtilityService.addNewUtility() have error:\n${error}`);
      throw error;
    }
  }

  static async updateUtility(id, data) {
    try {
      logger.info("UtilityService.updateUtility() is called.");
      const updatedUtility = await Utility.findByIdAndUpdate(id, data, {
        new: true
      });
      if (!updatedUtility) {
        throw new ApiError(404, `No utility found matching id ${id}.`);
      }
      return updatedUtility;
    } catch (error) {
      logger.error(`UtilityService.updateUtility() have error:\n${error}`);
      throw error;
    }
  }

  static async deleteUtility(id) {
    try {
      logger.info("UtilityService.deleteUtility() is called.");
      const deletedUtility = await Utility.findByIdAndDelete(id);
      if (!deletedUtility) {
        throw new ApiError(404, `No utility found matching id ${id}.`);
      }

      let copyUtilityImages = [...deletedUtility.images];
      if (copyUtilityImages.length > 0) {
        for (const imageId of copyUtilityImages) {
          await UtilityService.deleteUtilityImage(imageId);
        }
      }

      const rooms = await RoomService.getAllRooms({ utilities: id });
      for (const room of rooms) {
        await RoomService.deleteUtilitiesForRoom(room._id, [id]);
      }

      return deletedUtility;
    } catch (error) {
      logger.error(`UtilityService.deleteUtility() have error:\n${error}`);
      throw error;
    }
  }
}

module.exports = UtilityService;
