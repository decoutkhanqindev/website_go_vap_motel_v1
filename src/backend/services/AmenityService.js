const logger = require("../utils/logger");
const ApiError = require("../utils/ApiError");
const Amenity = require("../models/Amenity");
const AmenityImage = require("../models/AmenityImage");

class AmenityService {
  static async getAllAmentities() {
    try {
      logger.info(`AmenityService.getAllAmentities() is called.`);
      const amenities = await Amenity.find();
      if (!amenities.length) throw new ApiError(404, `No amenities found.`);
      return amenities;
    } catch (error) {
      logger.error(`AmenityService.getAllRooms()  have error:\n${error}`);
      throw error;
    }
  }

  static async getAmenityById(id) {
    try {
      logger.info(`AmenityService.getAmentityById() is called.`);
      const amenity = await Amenity.findById(id);
      if (!amenity)
        throw new ApiError(404, `Not amenity found matching id ${id}.`);
      return amenity;
    } catch (error) {
      logger.error(`AmenityService.getAmentityById()  have error:\n${error}`);
      throw error;
    }
  }

  static async isExits(name) {
    try {
      logger.info("AmenityService.isExits() is called.");
      const amenity = await Amenity.findOne({ name: name });
      if (amenity) return true;
      return false;
    } catch (error) {
      logger.error(`AmenityService.isExits() have error:\n${error}`);
      throw error;
    }
  }

  static async getAmenityImageById(id) {
    try {
      logger.info(`AmenityService.getAmenityImageById() is called.`);
      const amenityImage = await AmenityImage.findById(id);
      if (!amenityImage)
        throw new ApiError(404, `Not amenity image found matching id ${id}.`);
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
      const newAmenitymage = new AmenityImage(data);
      const addedAmenitymage = await newAmenitymage.save();
      return addedAmenitymage;
    } catch (error) {
      logger.error(`AmenityService.addNewAmenityImage() have error:\n${error}`);
      throw error;
    }
  }

  static async deleteAmenityImage(id) {
    try {
      logger.info("AmenityService.deleteAmenityImage() is called.");
      const deletedAmenitymage = await AmenityImage.findByIdAndDelete(id);
      return deletedAmenitymage;
    } catch (error) {
      logger.error(`AmenityService.deleteAmenityImage() have error:\n${error}`);
      throw error;
    }
  }

  static async addImagesToAmenity(id, imageFiles) {
    try {
      logger.info("AmenityService.addImagesToAmenity() is called.");
      const amenity = await AmenityService.getAmenityById(id);
      let copyAmenityImages = [...amenity.images];

      for (const file of imageFiles) {
        const data = {
          amenityId: amenity._id,
          data: file.buffer,
          contentType: file.mimetype
        };
        const addedAmenityImage = await AmenityService.addNewAmenityImage(data);
        copyAmenityImages.push(addedAmenityImage._id);
      }

      amenity.images = copyAmenityImages;

      const updatedAmenity = await amenity.save();
      return updatedAmenity;
    } catch (error) {
      logger.error(`AmenityService.addImagesToAmenity() have error:\n${error}`);
      throw error;
    }
  }

  static async deleteImageForAmenity(id, imageId) {
    try {
      logger.info("AmenityService.deleteImageForAmenity() is called.");
      const amenity = await AmenityService.getAmenityById(id);
      let copyAmenityImages = [...amenity.images];
      const imageIndex = copyAmenityImages.findIndex((id) =>
        id.equals(imageId)
      );

      copyAmenityImages.splice(imageIndex, 1);
      amenity.images = copyAmenityImages;

      const updatedAmenity = await amenity.save();
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

      const isExits = await AmenityService.isExits(name);
      if (isExits) throw new ApiError(409, "This amenity already exists.");

      let newAmenity = new Amenity(data);
      const addedAmenity = await newAmenity.save();

      if (imageFiles && Array.isArray(imageFiles) && imageFiles.length > 0) {
        newAmenity = await AmenityService.addImagesToAmenity(
          newAmenity._id,
          imageFiles
        );
      }

      const updatedAmentiy = await AmenityService.getAmenityById(addedAmenity);
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
