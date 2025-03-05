const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const AmenityService = require("../services/AmenityService");

class AmenityController {
  static async getAllAmenities(req, res, next) {
    try {
      logger.info("AmenityController.getAllAmenities() is called.");
      const amenities = await AmenityService.getAllAmentities();
      res.status(200).json(amenities);
    } catch (error) {
      logger.error(`AmenityController.getAllAmenities() have error:\n${error}`);
      next(error);
    }
  }

  static async getAmenityById(req, res, next) {
    try {
      logger.info("AmenityController.getAmenityById() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param must be provided."));
      }
      const amenity = await AmenityService.getAmenityById(id);
      res.status(200).json(amenity);
    } catch (error) {
      logger.error(`AmenityController.getAmenityById() have error:\n${error}`);
      next(error);
    }
  }

  static async getAmenityImageById(req, res, next) {
    try {
      logger.info("AmenityController.getAmenityImageById() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param must be provided."));
      }
      const amenityImage = await AmenityService.getAmenityImageById(id);
      res.status(200).json(amenityImage);
    } catch (error) {
      logger.error(
        `AmenityController.getAmenityImageById() have error:\n${error}`
      );
      next(error);
    }
  }

  static async addImagesToAmenity(req, res, next) {
    try {
      logger.info("AmenityController.addImagesToAmenity() is called.");
      const id = req.params.id;
      const imageFiles = req.files;

      if (!id) {
        return next(new ApiError(400, "Param must be provided."));
      }

      if (imageFiles && imageFiles.length === 0) {
        return next(new ApiError(400, "At least one image must be added."));
      }

      const updatedAmenity = await AmenityService.addImagesToAmenity(
        id,
        imageFiles
      );
      res.status(201).json(updatedAmenity);
    } catch (error) {
      logger.error(
        `AmenityController.addImagesToAmenity() have error:\n${error}`
      );
      next(error);
    }
  }

  static async deleteImageForAmenity(req, res, next) {
    try {
      logger.info("AmenityController.deleteImageForAmenity() is called.");
      const { id, imageId } = req.params;
      if (!id || !imageId) {
        return next(new ApiError(400, "Params must be provided."));
      }
      const updatedAmenity = await AmenityService.deleteImageForAmenity(
        id,
        imageId
      );
      res.status(201).json(updatedAmenity);
    } catch (error) {
      logger.error(
        `AmenityController.deleteImageForAmenity() have error:\n${error}`
      );
      next(error);
    }
  }

  static async addNewAmenity(req, res, next) {
    try {
      logger.info("AmenityController.addNewAmenity() is called.");
      const data = req.body;
      const imageFiles = req.files;
      if (!data.name || !data.price) {
        return next(new ApiError(400, "No form data found."));
      }
      const addedAmenity = await AmenityService.addNewAmenity(data, imageFiles);
      res.status(201).json(addedAmenity);
    } catch (error) {
      logger.error(`AmenityController.addNewAmenity() have error:\n${error}`);
      next(error);
    }
  }

  static async updateAmenity(req, res, next) {
    try {
      logger.info("AmenityController.updateAmenity() is called.");
      const id = req.params.id;
      const data = req.body;

      if (!id) {
        return next(new ApiError(400, "Param must be provided."));
      }

      if (!data.name && !data.price) {
        return next(new ApiError(400, "At least one field must be updated."));
      }

      const updatedAmenity = await AmenityService.updateAmenity(id, data);
      res.status(200).json(updatedAmenity);
    } catch (error) {
      logger.error(`AmenityController.updateAmenity() have error:\n${error}`);
      next(error);
    }
  }

  static async deleteAmenity(req, res, next) {
    try {
      logger.info("AmenityController.deleteAmenity() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param must be provided."));
      }
      const deletedAmenity = await AmenityService.deleteAmenity(id);
      res.status(200).json(deletedAmenity);
    } catch (error) {
      logger.error(`AmenityController.deleteAmenity() have error:\n${error}`);
      next(error);
    }
  }
}

module.exports = AmenityController;
