const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const RepairRequestService = require("../services/RepairRequestService");

class RepairRequestController {
  static async getAllRepairRequests(req, res, next) {
    try {
      logger.info("RepairRequestController.getAllRepairRequests() is called.");
      const query = req.query;
      const filter = {};

      if (query.roomId) filter.roomId = query.roomId;
      if (query.status) filter.status = query.status;
      if (query.requestDate) filter.requestDate = query.requestDate;

      const repairRequests = await RepairRequestService.getAllRepairRequests(
        filter
      );
      res.status(200).json(repairRequests);
    } catch (error) {
      logger.error(
        `RepairRequestController.getAllRepairRequests() have error:\n${error}`
      );
      next(error);
    }
  }

  static async getRepairRequestById(req, res, next) {
    try {
      logger.info("RepairRequestController.getRepairRequestById() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }
      const repairRequest = await RepairRequestService.getRepairRequestById(id);
      res.status(200).json(repairRequest);
    } catch (error) {
      logger.error(
        `RepairRequestController.getRepairRequestById() have error:\n${error}`
      );
      next(error);
    }
  }

  static async getRepairRequestImageById(req, res, next) {
    try {
      logger.info(
        "RepairRequestController.getRepairRequestImageById() is called."
      );
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }
      const repairRequestImage =
        await RepairRequestService.getRepairRequestImageById(id);
      res.status(200).json(repairRequestImage);
    } catch (error) {
      logger.error(
        `RepairRequestController.getRepairRequestImageById() have error:\n${error}`
      );
      next(error);
    }
  }

  static async addImagesToRepairRequest(req, res, next) {
    try {
      logger.info(
        "RepairRequestController.addImagesToRepairRequest() is called."
      );
      const id = req.params.id;
      const imageFiles = req.files;

      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }

      if (
        !imageFiles ||
        !Array.isArray(imageFiles) ||
        imageFiles.length === 0
      ) {
        return next(new ApiError(400, "At least one image must be added."));
      }

      const updatedRepairRequest =
        await RepairRequestService.addImagesToRepairRequest(id, imageFiles);
      res.status(201).json(updatedRepairRequest);
    } catch (error) {
      logger.error(
        `RepairRequestController.addImagesToRepairRequest() have error:\n${error}`
      );
      next(error);
    }
  }

  static async deleteImagesForRepairRequest(req, res, next) {
    try {
      logger.info(
        "RepairRequestController.deleteImagesForRepairRequest() is called."
      );
      const id = req.params.id;
      const imageIds = req.body.Images;

      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }

      if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
        return next(new ApiError(400, "At least one image must be provided."));
      }

      const updatedRepairRequest =
        await RepairRequestService.deleteImagesForRepairRequest(id, imageIds);
      res.status(200).json(updatedRepairRequest);
    } catch (error) {
      logger.error(
        `RepairRequestController.deleteImagesForRepairRequest() have error:\n${error}`
      );
      next(error);
    }
  }

  static async addNewRepairRequest(req, res, next) {
    try {
      logger.info("RepairRequestController.addNewRepairRequest() is called.");
      const data = req.body;
      const imageFiles = req.files;

      if (!data.roomId || !data.requestDate || !data.status) {
        return next(new ApiError(400, "No form data found."));
      }

      const addedRepairRequest = await RepairRequestService.addNewRepairRequest(
        data,
        imageFiles
      );
      res.status(201).json(addedRepairRequest);
    } catch (error) {
      logger.error(
        `RepairRequestController.addNewRepairRequest() have error:\n${error}`
      );
      next(error);
    }
  }

  static async updateRepairRequest(req, res, next) {
    try {
      logger.info("RepairRequestController.updateRepairRequest() is called.");
      const id = req.params.id;
      const data = req.body;

      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }

      if (
        !data.roomId &&
        !data.requestDate &&
        !data.status &&
        !data.description
      ) {
        return next(new ApiError(400, "At least one field must be updated."));
      }

      const updatedRepairRequest =
        await RepairRequestService.updateRepairRequest(id, data);
      res.status(200).json(updatedRepairRequest);
    } catch (error) {
      logger.error(
        `RepairRequestController.updateRepairRequest() have error:\n${error}`
      );
      next(error);
    }
  }

  static async deleteRepairRequest(req, res, next) {
    try {
      logger.info("RepairRequestController.deleteRepairRequest() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }
      const deletedRepairRequest =
        await RepairRequestService.deleteRepairRequest(id);
      res.status(200).json(deletedRepairRequest);
    } catch (error) {
      logger.error(
        `RepairRequestController.deleteRepairRequest() have error:\n${error}`
      );
      next(error);
    }
  }
}

module.exports = RepairRequestController;
