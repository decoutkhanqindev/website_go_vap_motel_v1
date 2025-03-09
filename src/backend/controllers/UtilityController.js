const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const UtilityService = require("../services/UtilityService");

class UtilityController {
  static async getAllUtilities(req, res, next) {
    try {
      logger.info("UtilityController.getAllUtilities() is called.");
      const utilities = await UtilityService.getAllUtilities();
      res.status(200).json(utilities);
    } catch (error) {
      logger.error(`UtilityController.getAllUtilities() have error:\n${error}`);
      next(error);
    }
  }

  static async getUtilityById(req, res, next) {
    try {
      logger.info("UtilityController.getUtilityById() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }
      const utility = await UtilityService.getUtilityById(id);
      res.status(200).json(utility);
    } catch (error) {
      logger.error(`UtilityController.getUtilityById() have error:\n${error}`);
      next(error);
    }
  }

  static async getUtilityImageById(req, res, next) {
    try {
      logger.info("UtilityController.getUtilityImageById() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }
      const utilityImage = await UtilityService.getUtilityImageById(id);
      res.status(200).json(utilityImage);
    } catch (error) {
      logger.error(
        `UtilityController.getUtilityImageById() have error:\n${error}`
      );
      next(error);
    }
  }

  static async addImagesToUtility(req, res, next) {
    try {
      logger.info("UtilityController.addImagesToUtility() is called.");
      const id = req.params.id;
      const imageFiles = req.files;

      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }

      if (imageFiles && imageFiles.length === 0) {
        return next(new ApiError(400, "At least one image must be added."));
      }

      const updatedUtility = await UtilityService.addImagesToUtility(
        id,
        imageFiles
      );
      res.status(201).json(updatedUtility);
    } catch (error) {
      logger.error(
        `UtilityController.addImagesToUtility() have error:\n${error}`
      );
      next(error);
    }
  }

  static async deleteImagesForUtility(req, res, next) {
    try {
      logger.info("UtilityController.deleteImagesForUtility() is called.");
      const id = req.params.id;
      const imageIds = req.body.images;

      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }

      if (imageIds && imageIds.length === 0) {
        return next(new ApiError(400, "At least one image must be deleted."));
      }

      const updatedUtility = await UtilityService.deleteImagesForUtility(
        id,
        imageIds
      );
      res.status(201).json(updatedUtility);
    } catch (error) {
      logger.error(
        `UtilityController.deleteImagesForUtility() have error:\n${error}`
      );
      next(error);
    }
  }

  static async addNewUtility(req, res, next) {
    try {
      logger.info("UtilityController.addNewUtility() is called.");
      const data = req.body;
      const imageFiles = req.files;
      if (!data.name || !data.price) {
        return next(new ApiError(400, "No form data found."));
      }
      const addedUtility = await UtilityService.addNewUtility(data, imageFiles);
      res.status(201).json(addedUtility);
    } catch (error) {
      logger.error(`UtilityController.addNewUtility() have error:\n${error}`);
      next(error);
    }
  }

  static async updateUtility(req, res, next) {
    try {
      logger.info("UtilityController.updateUtility() is called.");
      const id = req.params.id;
      const data = req.body;

      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }

      if (!data.name && !data.price) {
        return next(new ApiError(400, "At least one field must be updated."));
      }

      const updatedUtility = await UtilityService.updateUtility(id, data);
      res.status(200).json(updatedUtility);
    } catch (error) {
      logger.error(`UtilityController.updateUtility() have error:\n${error}`);
      next(error);
    }
  }

  static async deleteUtility(req, res, next) {
    try {
      logger.info("UtilityController.deleteUtility() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }
      const deletedUtility = await UtilityService.deleteUtility(id);
      res.status(200).json(deletedUtility);
    } catch (error) {
      logger.error(`UtilityController.deleteUtility() have error:\n${error}`);
      next(error);
    }
  }
}

module.exports = UtilityController;
