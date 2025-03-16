const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const moment = require("moment-timezone");
const RoomService = require("../services/RoomService");
const UtilityService = require("../services/UtilityService");
const Invoice = require("../models/Invoice");

class InvoiceService {
  static async getAllInvoices(filter = {}) {
    try {
      logger.info(`InvoiceService.InvoiceService() is called.`);
      let query = Invoice.find();

      if (filter.roomId) query = query.where("roomId").equals(filter.roomId);
      if (filter.issueDate)
        query = query.where("issueDate").equals(filter.issueDate);
      if (filter.dueDate) query = query.where("dueDate").equals(filter.dueDate);
      if (filter.paymentStatus)
        query = query.where("paymentStatus").equals(filter.paymentStatus);
      if (filter.paymentMethod)
        query = query.where("paymentMethod").equals(filter.paymentMethod);
      if (filter.paymentDate)
        query = query.where("paymentDate").equals(filter.paymentDate);

      const invoices = await query;
      if (!invoices.length) {
        throw new ApiError(404, `No invoices found matching your filter.`);
      }
      return invoices;
    } catch (error) {
      logger.info(`InvoiceService.InvoiceService() have error:\n${error}`);
      throw error;
    }
  }

  static async getInvoiceById(id) {
    try {
      logger.info(`InvoiceService.getInvoiceById() is called.`);
      const invoice = await Invoice.findById(id);
      if (!invoice) {
        throw new ApiError(404, `No invoice found matching id ${id}.`);
      }
      return invoice;
    } catch (error) {
      logger.info(`InvoiceService.getInvoiceById() have error:\n${error}`);
      throw error;
    }
  }

  static async isExists(roomId, issueDate, dueDate) {
    try {
      logger.info(`InvoiceService.isExists() is called.`);
      const invoice = await Invoice.findOne({
        roomId: roomId,
        issueDate: issueDate,
        dueDate: dueDate
      });
      return !!invoice;
    } catch (error) {
      logger.info(`InvoiceService.isExists() have error:\n${error}`);
      throw error;
    }
  }

  static async generateInvoiceCode(roomNumber, issueDate, dueDate) {
    try {
      logger.info(`InvoiceService.generateInvoiceCode() is called.`);
      const formatIssueDate = moment(issueDate).format("YYYYMMDD");
      const formatDueDate = moment(dueDate).format("YYYYMMDD");

      const lastInvoice = await Invoice.findOne().sort({ _id: -1 });
      if (!lastInvoice)
        return `${formatIssueDate}${formatDueDate}${roomNumber}1`;

      const lastInvoiceCode = lastInvoice.invoiceCode;
      const lastInvoiceNumber = parseInt(
        lastInvoiceCode.slice(
          formatIssueDate.length + formatDueDate.length + roomNumber.length
        ),
        10
      );

      const newInvoiceNumber = lastInvoiceNumber + 1;
      const newInvoiceCode = `${formatIssueDate}${formatDueDate}${roomNumber}${newInvoiceNumber}`;
      return newInvoiceCode;
    } catch (error) {
      logger.info(
        `InvoiceService.generateInvoiceCode() has an error:\n${error}`
      );
      throw error;
    }
  }

  static async addNewInvoice(data) {
    try {
      logger.info("InvoiceService.addNewInvoice() is called.");
      const { roomId, invoiceCode, issueDate, dueDate, electricity, water } =
        data;
      const room = await RoomService.getRoomById(roomId);

      let totalAmount = 0;

      const isExists = await InvoiceService.isExists(roomId);
      if (isExists) throw new ApiError(409, "This Invoice already exists.");

      if (!invoiceCode) {
        data.invoiceCode = await InvoiceService.generateInvoiceCode(
          room.roomNumber,
          issueDate,
          dueDate
        );
      }

      totalAmount += room.rentPrice;

      if (
        electricity?.oldIndex !== undefined &&
        electricity?.newIndex !== undefined &&
        electricity?.pricePerUnit
      ) {
        const electricityAmount =
          (electricity.newIndex - electricity.oldIndex) *
          electricity.pricePerUnit;
        totalAmount += electricityAmount;
        data.electricity.amount = electricityAmount;
      }

      if (
        water?.oldIndex !== undefined &&
        water?.newIndex !== undefined &&
        water?.pricePerUnit
      ) {
        const waterAmount =
          (water.newIndex - water.oldIndex) * water.pricePerUnit;
        totalAmount += waterAmount;
        data.water.amount = waterAmount;
      }

      if (room.utilities && room.utilities.length > 0) {
        for (const utilityId of room.utilities) {
          const utilityAmount = await UtilityService.getUtilityById(utilityId);
          totalAmount += utilityAmount.price;
        }
      }

      data.rentAmount = room.rentPrice;
      data.utilities = room.utilities;
      data.totalAmount = totalAmount;

      const newInvoice = new Invoice(data);
      const addedInvoice = await newInvoice.save();
      return addedInvoice;
    } catch (error) {
      logger.error(`InvoiceService.addNewInvoice() has an error:\n${error}`);
      throw error;
    }
  }

  static async updateInvoice(id, data) {
    try {
      logger.info("InvoiceService.deleteInvoice() is called.");
      const updatedInvoice = await Invoice.findByIdAndUpdate(id, data, {
        new: true
      });
      if (!updatedInvoice) {
        throw new ApiError(404, `No invoice found matching id ${id}.`);
      }
      return updatedInvoice;
    } catch (error) {
      logger.error(`InvoiceService.deleteInvoice() have error:\n${error}`);
      throw error;
    }
  }

  static async deleteInvoice(id) {
    try {
      logger.info("InvoiceService.deleteInvoice() is called.");
      const deletedInvoice = await Invoice.findByIdAndDelete(id);
      if (!deletedInvoice) {
        throw new ApiError(404, `No invoice found matching id ${id}.`);
      }
      return deletedInvoice;
    } catch (error) {
      logger.error(`InvoiceService.deleteInvoice() have error:\n${error}`);
      throw error;
    }
  }

  static async markInvoiceIsPaid(id, paymentMethod) {
    try {
      logger.info("InvoiceService.deleteInvoice() is called.");
      const updatedInvoice = await Invoice.findByIdAndUpdate(
        id,
        {
          paymentStatus: "Paid",
          paymentDate: new Date(),
          paymentMethod: paymentMethod
        },
        {
          new: true 
        }
      );
      if (!updatedInvoice) {
        throw new ApiError(404, `No invoice found matching id ${id}.`);
      }
      return updatedInvoice;
    } catch (error) {
      logger.error(`InvoiceService.deleteInvoice() have error:\n${error}`);
      throw error;
    }
  }
}

module.exports = InvoiceService;
