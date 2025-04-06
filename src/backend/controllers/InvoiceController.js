const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const InvoiceService = require("../services/InvoiceService");

class InvoiceController {
  static async getAllInvoices(req, res, next) {
    try {
      logger.info("InvoiceController.getAllInvoices() is called.");
      const query = req.query;
      const filter = {};

      if (query.invoiceCode) filter.invoiceCode = query.invoiceCode;
      if (query.roomId) filter.roomId = query.roomId;
      if (query.issueDate) filter.issueDate = query.issueDate;
      if (query.dueDate) filter.dueDate = query.dueDate;
      if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
      if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
      if (query.paymentDate) filter.paymentDate = query.paymentDate;

      const invoices = await InvoiceService.getAllInvoices(filter);
      res.status(200).json(invoices);
    } catch (error) {
      logger.error(`InvoiceController.getAllInvoices() have error:\n${error}`);
      next(error);
    }
  }

  static async getInvoiceById(req, res, next) {
    try {
      logger.info("InvoiceController.getInvoiceById() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }
      const invoice = await InvoiceService.getInvoiceById(id);
      res.status(200).json(invoice);
    } catch (error) {
      logger.error(`InvoiceController.getInvoiceById() have error:\n${error}`);
      next(error);
    }
  }

  static async addNewInvoice(req, res, next) {
    try {
      logger.info("InvoiceController.addNewInvoice() is called.");
      const data = req.body;

      if (
        !data.roomId ||
        !data.rentAmount ||
        !data.issueDate ||
        !data.dueDate ||
        !data.electricity ||
        !data.water ||
        !data.utilities ||
        !data.paymentStatus ||
        !data.paymentMethod
      ) {
        return next(new ApiError(400, "No form data found."));
      }

      const addedInvoice = await InvoiceService.addNewInvoice(data);
      res.status(201).json(addedInvoice);
    } catch (error) {
      logger.error(`InvoiceController.addNewInvoice() have error:\n${error}`);
      next(error);
    }
  }

  static async updateInvoice(req, res, next) {
    try {
      logger.info("InvoiceController.updateInvoice() is called.");
      const id = req.params.id;
      const data = req.body;

      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }

      if (
        !data.roomId &&
        !data.rentAmount &&
        !data.issueDate &&
        !data.dueDate &&
        !data.electricity &&
        !data.water &&
        !data.utilities &&
        !data.paymentStatus &&
        !data.paymentMethod &&
        !data.paymentDate
      ) {
        return next(new ApiError(400, "At least one field must be updated."));
      }

      const updatedInvoice = await InvoiceService.updateInvoice(id, data);
      res.status(200).json(updatedInvoice);
    } catch (error) {
      logger.error(`InvoiceController.updateInvoice() have error:\n${error}`);
      next(error);
    }
  }

  static async deleteInvoice(req, res, next) {
    try {
      logger.info("InvoiceController.deleteInvoice() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }
      const deletedInvoice = await InvoiceService.deleteInvoice(id);
      res.status(200).json(deletedInvoice);
    } catch (error) {
      logger.error(`InvoiceController.deleteInvoice() have error:\n${error}`);
      next(error);
    }
  }

  static async markInvoiceIsPaid(req, res, next) {
    try {
      logger.info("InvoiceController.markInvoiceIsPaid() is called.");
      const id = req.params.id;
      const paymentMethod = req.body.paymentMethod;

      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }

      if (!paymentMethod) {
        return next(new ApiError(400, "Payment method must be provided."));
      }

      const updatedInvoice = await InvoiceService.markInvoiceIsPaid(
        id,
        paymentMethod
      );
      res.status(200).json(updatedInvoice);
    } catch (error) {
      logger.error(
        `InvoiceController.markInvoiceIsPaid() have error:\n${error}`
      );
      next(error);
    }
  }
}

module.exports = InvoiceController;
