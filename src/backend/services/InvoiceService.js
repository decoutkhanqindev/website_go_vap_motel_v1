const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const Invoice = require("../models/Invoice");

class InvoiceService {
  static async getAllInvoices(filter) {
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
      const { roomId, invoiceCode, issueDate, dueDate } = data;

      const isExists = await InvoiceService.isExists(roomId);
      if (isExists) throw new ApiError(409, "This Invoice already exists.");

      if (!invoiceCode) {
        const room = await RoomService.getRoomById(roomId);
        const roomNumber = room.roomNumber;
        data.invoiceCode = await InvoiceService.generateInvoiceCode(
          roomNumber,
          issueDate,
          dueDate
        );
      }

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

  static async markInvoiceIsPaid(id) {
    try {
      logger.info("InvoiceService.deleteInvoice() is called.");
      const updatedInvoice = await Invoice.findByIdAndUpdate(
        id,
        { paymentStatus: "Paid", paymentDate: new Date() },
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
