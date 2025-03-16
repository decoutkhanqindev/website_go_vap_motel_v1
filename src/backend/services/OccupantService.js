const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const Occupant = require("../models/Occupant");
const OccupantImage = require("../models/OccupantImage");

class OccupantService {
  static async getAllOccupants(filter = {}) {
    try {
      logger.info(`OccupantService.getAllOccupants() is called.`);
      let query = Occupant.find();

      if (filter.roomId) query = query.where("roomId").equals(filter.roomId);
      if (filter.contractCode)
        query = query.where("contractCode").equals(filter.contractCode);
      if (filter.fullName)
        query = query.where("fullName").equals(filter.fullName);

      const occupants = await query;
      if (!occupants.length) {
        throw new ApiError(404, `No occupants found matching your filter.`);
      }
      return occupants;
    } catch (error) {
      logger.info(`OccupantService.getAllOccupants() have error:\n${error}`);
      throw error;
    }
  }

  static async getOccupantById(id) {
    try {
      logger.info(`OccupantService.getOccupantById() is called.`);
      const occupant = await Occupant.findById(id);
      if (!occupant) {
        throw new ApiError(404, `No occupant found matching id ${id}.`);
      }
      return occupant;
    } catch (error) {
      logger.info(`OccupantService.getOccupantById() have error:\n${error}`);
      throw error;
    }
  }

  static async isExists(roomId, contractCode, cccd) {
    try {
      logger.info(`OccupantService.isExists() is called.`);
      const occupant = await Occupant.findOne({
        cccd: cccd,
        roomId: roomId,
        contractCode: contractCode
      });
      return !!occupant;
    } catch (error) {
      logger.info(`OccupantService.isExists() have error:\n${error}`);
      throw error;
    }
  }

  static async getOccupantCccdImageById(id) {
    try {
      logger.info(`OccupantService.getOccupantCccdImageById() is called.`);
      const occupantImage = await OccupantImage.findById(id);
      if (!occupantImage) {
        throw new ApiError(
          404,
          `No occupant cccd images found matching id ${id}.`
        );
      }
      return occupantImage;
    } catch (error) {
      logger.error(
        `OccupantService.getOccupantCccdImageById()  have error:\n${error}`
      );
      throw error;
    }
  }

  static async addNewOccupantCccdImage(data) {
    try {
      logger.info("OccupantService.addNewOccupantCccdImage() is called.");
      const newOccupantImage = new OccupantImage(data);
      const addedOccupantImage = await newOccupantImage.save();
      return addedOccupantImage;
    } catch (error) {
      logger.error(
        `OccupantService.addNewOccupantCccdImage() have error:\n${error}`
      );
      throw error;
    }
  }

  static async deleteOccupantCccdImage(id) {
    try {
      logger.info("OccupantService.deleteOccupantImage() is called.");
      const deletedOccupantImage = await OccupantImage.findByIdAndDelete(id);
      if (!deletedOccupantImage) {
        throw new ApiError(
          404,
          `No occupant cccd image found matching id ${id}.`
        );
      }
      return deletedOccupantImage;
    } catch (error) {
      logger.error(
        `OccupantService.deleteOccupantImage() have error:\n${error}`
      );
      throw error;
    }
  }

  static async addCccdImagesToOccupant(id, imageFiles) {
    try {
      logger.info("OccupanService.addCccdImagesToOccupant() is called.");
      const occupant = await Occupant.findById(id);
      if (!occupant) {
        throw new ApiError(404, `No occupant found matching id ${id}.`);
      }

      let newImages = [];
      for (const file of imageFiles) {
        const data = {
          occupantId: id,
          data: file.buffer,
          contentType: file.mimetype
        };
        const addedOccupantCccdImage =
          await OccupantService.addNewOccupantCccdImage(data);
        newImages.push(addedOccupantCccdImage._id);
      }

      const updatedOccupant = await Occupant.findByIdAndUpdate(
        id,
        {
          $push: { cccdImages: { $each: newImages } }
        },
        { new: true }
      );
      return updatedOccupant;
    } catch (error) {
      logger.error(
        `OccupanService.addImagesToOccupant() have error:\n${error}`
      );
      throw error;
    }
  }

  static async deleteCccdImagesForOccupant(id, cccdImageIds) {
    try {
      logger.info("OccupanService.deleteCccdImagesForOccupant() is called.");
      const updatedOccupant = await Occupant.findByIdAndUpdate(
        id,
        {
          $pull: { cccdImages: { $in: cccdImageIds } }
        },
        { new: true }
      );

      if (!updatedOccupant) {
        throw new ApiError(404, `No occupant found matching id ${id}..`);
      }

      for (const cccdImageId of cccdImageIds) {
        await OccupantService.deleteOccupantCccdImage(cccdImageId);
      }

      return updatedOccupant;
    } catch (error) {
      logger.error(
        `OccupanService.deleteCccdImagesForOccupant() have error:\n${error}`
      );
      throw error;
    }
  }

  static async addNewOccupant(data, imageFiles) {
    try {
      logger.info("OccupantService.addNewOccupant() is called.");
      const { roomId, contractCode, cccd } = data;

      const isExits = await OccupantService.isExists(
        roomId,
        contractCode,
        cccd
      );
      if (isExits) throw new ApiError(409, "This occupant already exists.");

      let newOccupant = new Occupant(data);
      const addedOccupant = await newOccupant.save();

      if (imageFiles && Array.isArray(imageFiles) && imageFiles.length > 0) {
        newOccupant = await OccupantService.addCccdImagesToOccupant(
          newOccupant._id,
          imageFiles
        );
      }

      const updatedOccupant = await OccupantService.getOccupantById(
        addedOccupant._id
      );
      return updatedOccupant;
    } catch (error) {
      logger.error(`OccupantService.addNewOccupant() have error:\n${error}`);
      throw error;
    }
  }

  static async updateOccupant(id, data) {
    try {
      logger.info("OccupantService.updatedOccupant() is called.");
      const updatedOccupant = await Occupant.findByIdAndUpdate(id, data, {
        new: true
      });
      if (!updatedOccupant) {
        throw new ApiError(404, `No occupant found matching id ${id}.`);
      }
      return updatedOccupant;
    } catch (error) {
      logger.error(`OccupantService.updatedOccupant() have error:\n${error}`);
      throw error;
    }
  }

  static async deleteOccupant(id) {
    try {
      logger.info("OccupantService.deleteOccupant() is called.");
      const deletedOccupant = await Occupant.findByIdAndDelete(id);
      if (!deletedOccupant) {
        throw new ApiError(404, `No occupant found matching id ${id}.`);
      }

      let copyOccupantCccdImages = [...deletedOccupant.cccdImages];
      if (copyOccupantCccdImages.length > 0) {
        for (const imageId of copyOccupantCccdImages) {
          await OccupantService.deleteOccupantCccdImage(imageId);
        }
      }

      return deletedOccupant;
    } catch (error) {
      logger.error(`OccupantService.deleteOccupant() have error:\n${error}`);
      throw error;
    }
  }
}

module.exports = OccupantService;
