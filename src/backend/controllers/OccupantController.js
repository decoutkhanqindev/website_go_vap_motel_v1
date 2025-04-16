const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const OccupantService = require("../services/OccupantService");

class OccupantController {
  static async getAllOccupants(req, res, next) {
    try {
      logger.info("OccupantController.getAllOccupants() is called.");
      const query = req.query;
      const filter = {};

      if (query.roomId) filter.roomId = query.roomId;
      if (query.tenantId) filter.tenantId = query.tenantId;
      if (query.contractCode) filter.contractCode = query.contractCode;
      if (query.cccd) filter.cccd = query.cccd;

      const occupants = await OccupantService.getAllOccupants(filter);
      res.status(200).json(occupants);
    } catch (error) {
      logger.error(
        `OccupantController.getAllOccupants() have error:\n${error}`
      );
      next(error);
    }
  }

  static async getOccupantById(req, res, next) {
    try {
      logger.info("OccupantController.getOccupantById() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }
      const occupant = await OccupantService.getOccupantById(id);
      res.status(200).json(occupant);
    } catch (error) {
      logger.error(
        `OccupantController.getOccupantById() have error:\n${error}`
      );
      next(error);
    }
  }

  static async getOccupantCccdImageById(req, res, next) {
    try {
      logger.info("OccupantController.getOccupantCccdImageById() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }
      const occupantCccdImage = await OccupantService.getOccupantCccdImageById(
        id
      );
      res.status(200).json(occupantCccdImage);
    } catch (error) {
      logger.error(
        `OccupantController.getOccupantCccdImageById() have error:\n${error}`
      );
      next(error);
    }
  }

  static async addCccdImagesToOccupant(req, res, next) {
    try {
      logger.info("OccupantController.addCccdImagesToOccupant() is called.");
      const id = req.params.id;
      const imageFiles = req.files;

      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }

      if (imageFiles && imageFiles.length === 0) {
        return next(
          new ApiError(400, "At least one cccd image must be added.")
        );
      }

      const updatedOccupant = await OccupantService.addCccdImagesToOccupant(
        id,
        imageFiles
      );
      res.status(201).json(updatedOccupant);
    } catch (error) {
      logger.error(
        `OccupantController.addImagesToOccupant() have error:\n${error}`
      );
      next(error);
    }
  }

  static async deleteCccdImagesForOccupant(req, res, next) {
    try {
      logger.info(
        "OccupantController.deleteCccdImagesForOccupant() is called."
      );
      const id = req.params.id;
      const cccdImageIds = req.body.cccdImages;

      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }

      if (cccdImageIds && cccdImageIds.length === 0) {
        return next(new ApiError(400, "At least one image must be deleted."));
      }

      const updatedOccupant = await OccupantService.deleteCccdImagesForOccupant(
        id,
        cccdImageIds
      );
      res.status(201).json(updatedOccupant);
    } catch (error) {
      logger.error(
        `OccupantController.deleteCccdImagesForOccupant() have error:\n${error}`
      );
      next(error);
    }
  }

  static async addNewOccupant(req, res, next) {
    try {
      logger.info("OccupantController.addNewOccupant() is called.");
      const data = req.body;
      const imageFiles = req.files;

      if (
        !data.roomId ||
        !data.contractCode
        // !data.fullName ||
        // !data.birthday ||
        // !data.address ||
        // !data.phone ||
        // !data.cccd
      ) {
        return next(new ApiError(400, "No form data found."));
      }

      if (imageFiles && imageFiles.length < 0) {
        return next(new ApiError(400, "Cccd images must be provided"));
      }

      const addedOccupant = await OccupantService.addNewOccupant(
        data,
        imageFiles
      );
      res.status(201).json(addedOccupant);
    } catch (error) {
      logger.error(`OccupantController.addNewOccupant() have error:\n${error}`);
      next(error);
    }
  }

  static async updateOccupant(req, res, next) {
    try {
      logger.info("OccupantController.updateOccupant() is called.");
      const id = req.params.id;
      const data = req.body;

      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }

      if (
        !data.roomId &&
        !data.contractCode &&
        !data.fullname &&
        !data.birthday &&
        !data.address &&
        !data.phone &&
        !data.cccd
      ) {
        return next(new ApiError(400, "At least one field must be updated."));
      }

      const updatedOccupant = await OccupantService.updateOccupant(id, data);
      res.status(200).json(updatedOccupant);
    } catch (error) {
      logger.error(`OccupantController.updateOccupant() have error:\n${error}`);
      next(error);
    }
  }

  static async deleteOccupant(req, res, next) {
    try {
      logger.info("OccupantController.deleteOccupant() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }
      const deletedOccupant = await OccupantService.deleteOccupant(id);
      res.status(200).json(deletedOccupant);
    } catch (error) {
      logger.error(`OccupantController.deleteOccupant() have error:\n${error}`);
      next(error);
    }
  }
}

module.exports = OccupantController;
