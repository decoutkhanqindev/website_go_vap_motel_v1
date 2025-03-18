const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const RepairRequest = require("../models/RepairRequest");
const RepairRequestImage = require("../models/RepairRequestImage");

class RepairRequestService {
  static async getAllRepairRequests(filter = {}) {
    try {
      logger.info(`RepairRequestService.getAllRepairRequests() is called.`);
      let query = RepairRequest.find();

      if (filter.roomId) query = query.where("roomId").equals(filter.roomId);
      if (filter.status) query = query.where("status").equals(filter.status);
      if (filter.requestDate)
        query = query.where("requestDate").equals(filter.requestDate);

      const repairRequests = await query;
      if (!repairRequests.length) {
        throw new ApiError(
          404,
          `No repair requests found matching your filter.`
        );
      }
      return repairRequests;
    } catch (error) {
      logger.error(
        `RepairRequestService.getAllRepairRequests() have error:\n${error}`
      );
      throw error;
    }
  }

  static async getRepairRequestById(id) {
    try {
      logger.info(`RepairRequestService.getRepairRequestById() is called.`);
      const repairRequest = await RepairRequest.findById(id);
      if (!repairRequest) {
        throw new ApiError(404, `No repair request found matching id ${id}.`);
      }
      return repairRequest;
    } catch (error) {
      logger.info(
        `RepairRequestService.getRepairRequestById() have error:\n${error}`
      );
      throw error;
    }
  }

  static async getRepairRequestImageById(id) {
    try {
      logger.info(
        "RepairRequestService.getRepairRequestImageById() is called."
      );
      const repairRequestImage = await RepairRequestImage.findById(id);
      if (!repairRequestImage) {
        throw new ApiError(
          404,
          `No repair request image found matching id ${id}.`
        );
      }
      return repairRequestImage;
    } catch (error) {
      logger.error(
        `RepairRequestService.getRepairRequestImageById() have error:\n${error}`
      );
      throw error;
    }
  }

  static async addNewRepairRequestImage(data) {
    try {
      logger.info("RepairRequestService.addNewRepairRequestImage() is called.");
      const newRepairRequestImage = new RepairRequestImage(data);
      const addedRepairRequestImage = await newRepairRequestImage.save();
      return addedRepairRequestImage;
    } catch (error) {
      logger.error(
        `RepairRequestService.addNewRepairRequestImage() have error:\n${error}`
      );
      throw error;
    }
  }

  static async deleteRepairRequestImage(id) {
    try {
      logger.info("RepairRequestService.deleteRepairRequestImage() is called.");
      const deletedRepairRequestImage =
        await RepairRequestImage.findByIdAndDelete(id);
      if (!deletedRepairRequestImage) {
        throw new ApiError(
          404,
          `No repair request image found matching id ${id}.`
        );
      }
      return deletedRepairRequestImage;
    } catch (error) {
      logger.error(
        `RepairRequestService.deleteRepairRequestImage() have error:\n${error}`
      );
      throw error;
    }
  }

  static async addImagesToRepairRequest(id, imageFiles) {
    try {
      logger.info("RepairRequestService.addImagesToRepairRequest() is called.");
      const repairRequest = await RepairRequest.findById(id);
      if (!repairRequest) {
        throw new ApiError(404, `No repair request found matching id ${id}.`);
      }

      let newImages = [];
      for (const file of imageFiles) {
        const data = {
          repairRequestId: id,
          data: file.buffer,
          contentType: file.mimetype
        };
        const addedRepairRequestImage =
          await RepairRequestService.addNewRepairRequestImage(data);
        newImages.push(addedRepairRequestImage._id);
      }

      const updatedRepairRequest = await RepairRequest.findByIdAndUpdate(
        id,
        {
          $push: { images: { $each: newImages } }
        },
        { new: true }
      );
      return updatedRepairRequest;
    } catch (error) {
      logger.error(
        `RepairRequestService.addImagesToRepairRequest() have error:\n${error}`
      );
      throw error;
    }
  }

  static async deleteImagesForRepairRequest(id, imageIds) {
    try {
      logger.info(
        "RepairRequestService.deleteImagesForRepairRequest() is called."
      );
      const repairRequest = await RepairRequest.findById(id);
      if (!repairRequest) {
        throw new ApiError(404, `No repair request found matching id ${id}.`);
      }

      for (const imageId of imageIds) {
        await RepairRequestService.deleteRepairRequestImage(imageId);
      }

      const updatedRepairRequest = await RepairRequest.findByIdAndUpdate(
        id,
        {
          $pull: { images: { $in: imageIds } }
        },
        { new: true }
      );
      return updatedRepairRequest;
    } catch (error) {
      logger.error(
        `RepairRequestService.deleteImagesForRepairRequest() have error:\n${error}`
      );
      throw error;
    }
  }

  static async addNewRepairRequest(data, imageFiles) {
    try {
      logger.info("RepairRequestService.addNewRepairRequest() is called.");
      let newRepairRequest = new RepairRequest(data);
      const addedRepairRequest = await newRepairRequest.save();

      if (imageFiles && Array.isArray(imageFiles) && imageFiles.length > 0) {
        newRepairRequest = await RepairRequestService.addImagesToRepairRequest(
          newRepairRequest._id,
          imageFiles
        );
      }

      const updatedRepairRequest =
        await RepairRequestService.getRepairRequestById(addedRepairRequest._id);
      return updatedRepairRequest;
    } catch (error) {
      logger.error(
        `RepairRequestService.addNewRepairRequest() have error:\n${error}`
      );
      throw error;
    }
  }

  static async updateRepairRequest(id, data) {
    try {
      logger.info("RepairRequestService.updatedRepairRequest() is called.");
      const updatedRepairRequest = await RepairRequest.findByIdAndUpdate(
        id,
        data,
        {
          new: true
        }
      );
      if (!updatedRepairRequest) {
        throw new ApiError(404, `No repair request found matching id ${id}.`);
      }
      return updatedRepairRequest;
    } catch (error) {
      logger.error(
        `RepairRequestService.updatedRepairRequest() have error:\n${error}`
      );
      throw error;
    }
  }

  static async deleteRepairRequest(id) {
    try {
      logger.info("RepairRequestService.deleteRepairRequest() is called.");
      const deletedRepairRequest = await RepairRequest.findByIdAndDelete(id);
      if (!deletedRepairRequest) {
        throw new ApiError(404, `No repair request found matching id ${id}.`);
      }

      let copyRepairRequestImages = [...deletedRepairRequest.images];
      if (copyRepairRequestImages.length > 0) {
        for (const imageId of copyRepairRequestImages) {
          await RepairRequestService.deleteRepairRequestImage(imageId);
        }
      }

      return deletedRepairRequest;
    } catch (error) {
      logger.error(
        `RepairRequestService.deleteRepairRequest() have error:\n${error}`
      );
      throw error;
    }
  }
}

module.exports = RepairRequestService;
