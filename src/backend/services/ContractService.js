const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const moment = require("moment-timezone");
const Contract = require("../models/Contract");
const RoomService = require("../services/RoomService");

class ContractService {
  static async getAllContracts(filter = {}) {
    try {
      logger.info(`ContractService.getAllContracts() is called.`);
      let query = Contract.find();

      if (filter.roomId) query = query.where("roomId").equals(filter.roomId);
      if (filter.contractCode)
        query = query.where("contractCode").equals(filter.contractCode);
      if (filter.startDate)
        query = query.where("startDate").equals(filter.startDate);
      if (filter.endDate) query = query.where("endDate").equals(filter.endDate);
      if (filter.status) query = query.where("status").equals(filter.status);

      const contracts = await query;
      if (!contracts.length) {
        throw new ApiError(404, `No contracts found matching your filter.`);
      }
      return contracts;
    } catch (error) {
      logger.info(`ContractService.getAllContracts() have error:\n${error}`);
      throw error;
    }
  }

  static async getContractById(id) {
    try {
      logger.info(`ContractService.getContractById() is called.`);
      const contract = await Contract.findById(id);
      if (!contract) {
        throw new ApiError(404, `No contract found matching id ${id}.`);
      }
      return contract;
    } catch (error) {
      logger.info(`ContractService.getContractById() have error:\n${error}`);
      throw error;
    }
  }

  static async isExsits(roomId, startDate, dueDate) {
    try {
      logger.info(`ContractService.isExsits() is called.`);
      const contract = await Contract.findOne({
        roomId: roomId,
        startDate: startDate,
        dueDate: dueDate
      });
      return !!contract;
    } catch (error) {
      logger.info(`ContractService.isExsits() have error:\n${error}`);
      throw error;
    }
  }

  static async generateContractCode(roomNumber, startDate, endDate) {
    try {
      logger.info(`InvoiceService.generateInvoiceCode() is called.`);
      const formatStartDate = moment(startDate).format("YYYYMMDD");
      const formatEndDate = moment(endDate).format("YYYYMMDD");

      const lastContract = await Contract.findOne().sort({ _id: -1 });
      if (!lastContract)
        return `${formatStartDate}${formatEndDate}${roomNumber}1`;

      const lastContractCode = lastContract.contractCode;
      const lastContractNumber = parseInt(
        lastContractCode.slice(
          formatStartDate.length + formatEndDate.length + roomNumber.length
        ),
        10
      );

      const newContractNumber = lastContractNumber + 1;
      const newContractCode = `${formatStartDate}${formatEndDate}${roomNumber}${newContractNumber}`;
      return newContractCode;
    } catch (error) {
      logger.info(
        `InvoiceService.generateInvoiceCode() has an error:\n${error}`
      );
      throw error;
    }
  }

  static async addNewContract(data) {
    try {
      logger.info("ContractService.addNewContract() is called.");
      const { roomId, contractCode, startDate, endDate } = data;

      const isExits = await ContractService.isExsits(
        roomId,
        startDate,
        endDate
      );
      if (isExits) throw new ApiError(409, "This contract already exists.");

      if (!contractCode) {
        const room = await RoomService.getRoomById(roomId);
        const roomNumber = room.roomNumber;
        data.contractCode = await ContractService.generateContractCode(
          roomNumber,
          startDate,
          endDate
        );
      }

      await RoomService.updateRoom(roomId, { status: "occupied" });

      const newContract = new Contract(data);
      const addedContract = await newContract.save();
      return addedContract;
    } catch (error) {
      logger.error(`ContractService.addNewContract() have error:\n${error}`);
      throw error;
    }
  }

  static async updateContract(id, data) {
    try {
      logger.info("ContractService.deleteContract() is called.");
      const updatedContract = await Contract.findByIdAndUpdate(id, data, {
        new: true
      });
      if (!updatedContract) {
        throw new ApiError(404, `No contract found matching id ${id}.`);
      }
      return updatedContract;
    } catch (error) {
      logger.error(`ContractService.deleteContract() have error:\n${error}`);
      throw error;
    }
  }

  static async deleteContract(id) {
    try {
      logger.info("ContractService.deleteContract() is called.");
      const deletedContract = await Contract.findByIdAndDelete(id);
      if (!deletedContract) {
        throw new ApiError(404, `No contract found matching id ${id}.`);
      }

      await RoomService.updateRoom(deletedContract.roomId, {
        status: "vacant"
      });

      return deletedContract;
    } catch (error) {
      logger.error(`ContractService.deleteContract() have error:\n${error}`);
      throw error;
    }
  }

  static async extendContract(id, newEndDate) {
    try {
      logger.info("ContractService.extendContract() is called.");
      const updatedContract = await Contract.findByIdAndUpdate(
        id,
        { endDate: newEndDate },
        { new: true }
      );
      if (!updatedContract) {
        throw new ApiError(404, `No contract found matching id ${id}.`);
      }
      return updatedContract;
    } catch (error) {
      logger.error(`ContractService.extendContract() have error:\n${error}`);
      throw error;
    }
  }

  static async terminateContract(id) {
    try {
      logger.info("ContractService.terminateContract() is called.");
      const updatedContract = await Contract.findByIdAndUpdate(
        id,
        { status: "terminated" },
        { new: true }
      );
      if (!updatedContract) {
        throw new ApiError(404, `No contract found matching id ${id}.`);
      }
      return updatedContract;
    } catch (error) {
      logger.error(`ContractService.terminateContract() have error:\n${error}`);
      throw error;
    }
  }
}

module.exports = ContractService;
