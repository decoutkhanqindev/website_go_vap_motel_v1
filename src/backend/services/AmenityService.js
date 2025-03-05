const logger = require("../utils/logger");
const ApiError = require("../utils/ApiError");
const Amenity = require("../models/Amenity");
const AmenityImage = require("../models/AmenityImage");
const Utility = require("../models/Utility");

class AmenityService {
  static async getAllAmentities() {
    try {
      logger.info(`AmenityService.getAllAmentities() is called.`);
      const amenities = await Amenity.find();
      if (!amenities.length) {
        throw new ApiError(404, `No amenities found.`);
      }
      return amenities;
    } catch (error) {
      logger.error(`AmenityService.getAllAmentities()  have error:\n${error}`);
      throw error;
    }
  }

  static async getAmenityById(id) {
    try {
      logger.info(`AmenityService.getAmentityById() is called.`);
      const amenity = await Amenity.findById(id);
      if (!amenity) {
        throw new ApiError(404, `Not amenity found matching id ${id}.`);
      }
      return amenity;
    } catch (error) {
      logger.error(`AmenityService.getAmentityById()  have error:\n${error}`);
      throw error;
    }
  }

  static async isExists(name) {
    try {
      logger.info("AmenityService.isExists() is called.");
      const amenity = await Amenity.findOne({ name: name });
      if (amenity) return true;
      return false;
    } catch (error) {
      logger.error(`AmenityService.isExists() have error:\n${error}`);
      throw error;
    }
  }

  static async getAmenityImageById(id) {
    try {
      logger.info(`AmenityService.getAmenityImageById() is called.`);
      const amenityImage = await AmenityImage.findById(id);
      if (!amenityImage) {
        throw new ApiError(404, `Not amenity image found matching id ${id}.`);
      }
      return amenityImage;
    } catch (error) {
      logger.error(
        `AmenityService.getAmenityImageById()  have error:\n${error}`
      );
      throw error;
    }
  }

  static async addNewAmenityImage(data) {
    try {
      logger.info("AmenityService.addNewAmenityImage() is called.");
      const newAmenityImage = new AmenityImage(data);
      const addedAmenityImage = await newAmenityImage.save();
      if (!addedAmenityImage) {
        throw new ApiError(400, "Can not add new amenity image.");
      }
      return addedAmenityImage;
    } catch (error) {
      logger.error(`AmenityService.addNewAmenityImage() have error:\n${error}`);
      throw error;
    }
  }

  static async deleteAmenityImage(id) {
    try {
      logger.info("AmenityService.deleteAmenityImage() is called.");
      const deletedAmenityImage = await AmenityImage.findByIdAndDelete(id);
      if (!deletedAmenityImage) {
        throw new ApiError(400, "Can not delete amenity image.");
      }
      return deletedAmenityImage;
    } catch (error) {
      logger.error(`AmenityService.deleteAmenityImage() have error:\n${error}`);
      throw error;
    }
  }

  static async addImagesToAmenity(id, imageFiles) {
    try {
      logger.info("AmenityService.addImagesToAmenity() is called.");
      let newImages = [];
      for (const file of imageFiles) {
        const data = {
          amenityId: id,
          data: file.buffer,
          contentType: file.mimetype
        };
        const addedAmenityImage = await AmenityService.addNewAmenityImage(data);
        newImages.push(addedAmenityImage._id);
      }

      const updatedAmenity = await Amenity.findByIdAndUpdate(
        id,
        {
          $push: { images: { $each: newImages } }
        },
        { new: true }
      );
      if (!updatedAmenity) {
        throw new ApiError(
          400,
          `Can not add images for amenity with id ${id}.`
        );
      }
      return updatedAmenity;
    } catch (error) {
      logger.error(`AmenityService.addImagesToAmenity() have error:\n${error}`);
      throw error;
    }
  }

  static async deleteImageForAmenity(id, imageId) {
    try {
      logger.info("AmenityService.deleteImageForAmenity() is called.");
      const updatedAmenity = await Amenity.findByIdAndUpdate(
        id,
        {
          $pull: { images: imageId }
        },
        { new: true }
      );
      if (!updatedAmenity) {
        throw new ApiError(
          400,
          `Can not delete image for amenity with id ${id}.`
        );
      }
      await AmenityService.deleteAmenityImage(imageId);
      return updatedAmenity;
    } catch (error) {
      logger.error(
        `AmenityService.deleteImageForAmenity() have error:\n${error}`
      );
      throw error;
    }
  }

  static async addNewAmenity(data, imageFiles) {
    try {
      logger.info("AmenityService.addNewAmenity() is called.");
      const { name } = data;

      const isExits = await AmenityService.isExists(name);
      if (isExits) {
        throw new ApiError(409, "This amenity already exists.");
      }

      let newAmenity = new Amenity(data);
      const addedAmenity = await newAmenity.save();
      if (!addedAmenity) {
        throw new ApiError(400, `Can not add new amenity.`);
      }

      if (imageFiles && Array.isArray(imageFiles) && imageFiles.length > 0) {
        newAmenity = await AmenityService.addImagesToAmenity(
          newAmenity._id,
          imageFiles
        );
      }

      const updatedAmentiy = await AmenityService.getAmenityById(
        addedAmenity._id
      );
      return updatedAmentiy;
    } catch (error) {
      logger.error(`AmenityService.addNewAmenity() have error:\n${error}`);
      throw error;
    }
  }

  static async updateAmenity(id, data) {
    try {
      logger.info("AmenityService.updateAmenity() is called.");
      const updatedAmenity = await Amenity.findByIdAndUpdate(id, data, {
        new: true
      });
      if (!updatedAmenity) {
        throw new ApiError(400, `Can not update amenity with id ${id}.`);
      }
      return updatedAmenity;
    } catch (error) {
      logger.error(`AmenityService.updateAmenity() have error:\n${error}`);
      throw error;
    }
  }

  static async deleteAmenity(id) {
    try {
      logger.info("AmenityService.deleteAmenity() is called.");
      const deletedAmenity = await Amenity.findByIdAndDelete(id);
      if (!deletedAmenity) {
        throw new ApiError(400, `Can not delete amenity with id ${id}..`);
      }

      let copyAmenityImages = [...deletedAmenity.images];
      if (copyAmenityImages.length > 0) {
        for (const imageId of copyAmenityImages) {
          await AmenityService.deleteAmenityImage(imageId);
        }
      }

      return deletedAmenity;
    } catch (error) {
      logger.error(`AmenityService.deleteAmenity() have error:\n${error}`);
      throw error;
    }
  }
}

module.exports = AmenityService;
