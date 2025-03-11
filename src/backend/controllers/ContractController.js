const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const ContractService = require("../services/ContractService");

class ContractController {
  static async getAllContracts(req, res, next) {
    try {
      logger.info("ContractController.getAllContracts() is called.");
      const query = req.query;
      const filter = {};

      if (query.roomId) filter.roomId = query.roomId;
      if (query.contractCode) filter.contractCode = query.contractCode;
      if (query.startDate) filter.startDate = query.startDate;
      if (query.endDate) filter.endDate = query.endDate;
      if (query.status) filter.status = query.status;

      const contracts = await ContractService.getAllContracts(filter);
      res.status(200).json(contracts);
    } catch (error) {
      logger.error(
        `ContractController.getAllContracts() have error:\n${error}`
      );
      next(error);
    }
  }

  static async getContractById(req, res, next) {
    try {
      logger.info("ContractController.getContractById() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }
      const contract = await ContractService.getContractById(id);
      res.status(200).json(contract);
    } catch (error) {
      logger.error(
        `ContractController.getContractById() have error:\n${error}`
      );
      next(error);
    }
  }

  static async addNewContract(req, res, next) {
    try {
      logger.info("ContractController.addNewContract() is called.");
      const data = req.body;

      if (
        !data.roomId ||
        !data.startDate ||
        !data.endDate ||
        !data.rentPrice ||
        !data.deposit ||
        !data.status
      ) {
        return next(new ApiError(400, "No form data found."));
      }

      const addedContract = await ContractService.addNewContract(data);
      res.status(201).json(addedContract);
    } catch (error) {
      logger.error(`ContractController.addNewContract() have error:\n${error}`);
      next(error);
    }
  }

  static async deleteContract(req, res, next) {
    try {
      logger.info("ContractController.deleteContract() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }
      const deletedContract = await ContractService.deleteContract(id);
      res.status(200).json(deletedContract);
    } catch (error) {
      logger.error(`ContractController.deleteContract() have error:\n${error}`);
      next(error);
    }
  }

  static async updateContractStatus(req, res, next) {
    try {
      logger.info("ContractController.updateContract() is called.");
      const id = req.params.id;
      const newStatus = req.body.status;

      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }

      if (!newStatus) {
        return next(new ApiError(400, "New status must be provided."));
      }

      const updatedContract = await ContractService.updateContractStatus(
        id,
        newStatus
      );
      res.status(200).json(updatedContract);
    } catch (error) {
      logger.error(`ContractController.updateContract() have error:\n${error}`);
      next(error);
    }
  }

  static async extendContract(req, res, next) {
    try {
      logger.info("ContractController.extendContract() is called.");
      const id = req.params.id;
      const newEndDate = req.body.endDate;

      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }

      if (!newEndDate) {
        return next(new ApiError(400, "New end date must be provided."));
      }

      const updatedContract = await ContractService.extendContract(
        id,
        newEndDate
      );
      res.status(200).json(updatedContract);
    } catch (error) {
      logger.error(`ContractController.extendContract() have error:\n${error}`);
      next(error);
    }
  }
}

module.exports = ContractController;
