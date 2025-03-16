const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const ExpenseService = require("../services/ExpenseService");

class ExpenseController {
  static async getAllExpenses(req, res, next) {
    try {
      logger.info("ExpenseController.getAllExpenses() is called.");
      const query = req.query;
      const filter = {};

      if (query.roomId) filter.roomId = query.roomId;
      if (query.expenseCode) filter.expenseCode = query.expenseCode;
      if (query.expenseDate) filter.expenseDate = query.expenseDate;
      if (query.category) filter.category = query.category;

      const expenses = await ExpenseService.getAllExpenses(filter);
      res.status(200).json(expenses);
    } catch (error) {
      logger.error(`ExpenseController.getAllExpenses() have error:\n${error}`);
      next(error);
    }
  }

  static async getExpenseById(req, res, next) {
    try {
      logger.info("ExpenseController.getExpenseById() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }
      const expense = await ExpenseService.getExpenseById(id);
      res.status(200).json(expense);
    } catch (error) {
      logger.error(`ExpenseController.getExpenseById() have error:\n${error}`);
      next(error);
    }
  }

  static async getExpenseReceiptImageById(req, res, next) {
    try {
      logger.info("ExpenseController.getExpenseReceiptImageById() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }
      const expenseReceipt = await ExpenseService.getExpenseReceiptImageById(
        id
      );
      res.status(200).json(expenseReceipt);
    } catch (error) {
      logger.error(
        `ExpenseController.getExpenseReceiptImageById() have error:\n${error}`
      );
      next(error);
    }
  }

  static async addReceiptImgesToExpense(req, res, next) {
    try {
      logger.info("ExpenseController.addReceiptImgesToExpense() is called.");
      const id = req.params.id;
      const receiptImageFiles = req.files;

      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }

      if (
        !receiptImageFiles ||
        !Array.isArray(receiptImageFiles) ||
        receiptImageFiles.length === 0
      ) {
        return next(
          new ApiError(400, "At least one receipt image must be added.")
        );
      }

      const updatedExpense = await ExpenseService.addReceiptImagesToExpense(
        id,
        receiptImageFiles
      );
      res.status(201).json(updatedExpense);
    } catch (error) {
      logger.error(
        `ExpenseController.addReceiptImgesToExpense() have error:\n${error}`
      );
      next(error);
    }
  }

  static async deleteReceiptImagesForExpense(req, res, next) {
    try {
      logger.info(
        "ExpenseController.deleteReceiptImagesForExpense() is called."
      );
      const id = req.params.id;
      const receiptImageIds = req.body.receiptImages;

      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }

      if (
        !receiptImageIds ||
        !Array.isArray(receiptImageIds) ||
        receiptImageIds.length === 0
      ) {
        return next(
          new ApiError(400, "At least one receipt image ID must be provided.")
        );
      }

      const updatedExpense = await ExpenseService.deleteReceiptImagesForExpense(
        id,
        receiptImageIds
      );
      res.status(200).json(updatedExpense);
    } catch (error) {
      logger.error(
        `ExpenseController.deleteReceiptImagesForExpense() have error:\n${error}`
      );
      next(error);
    }
  }

  static async addNewExpense(req, res, next) {
    try {
      logger.info("ExpenseController.addNewExpense() is called.");
      const data = req.body;
      const receiptImageFiles = req.files;

      if (!data.roomId || !data.expenseDate || !data.category || !data.amount) {
        return next(new ApiError(400, "Required fields must be provided."));
      }

      const addedExpense = await ExpenseService.addNewExpense(
        data,
        receiptImageFiles
      );
      res.status(201).json(addedExpense);
    } catch (error) {
      logger.error(`ExpenseController.addNewExpense() have error:\n${error}`);
      next(error);
    }
  }

  static async updateExpense(req, res, next) {
    try {
      logger.info("ExpenseController.updateExpense() is called.");
      const id = req.params.id;
      const data = req.body;

      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }

      if (
        !data.roomId &&
        !data.expenseDate &&
        !data.category &&
        !data.amount &&
        !data.description &&
        !data.notes
      ) {
        return next(new ApiError(400, "At least one field must be updated."));
      }

      const updatedExpense = await ExpenseService.updateExpense(id, data);
      res.status(200).json(updatedExpense);
    } catch (error) {
      logger.error(`ExpenseController.updateExpense() have error:\n${error}`);
      next(error);
    }
  }

  static async deleteExpense(req, res, next) {
    try {
      logger.info("ExpenseController.deleteExpense() is called.");
      const id = req.params.id;
      if (!id) {
        return next(new ApiError(400, "Param id must be provided."));
      }
      const deletedExpense = await ExpenseService.deleteExpense(id);
      res.status(200).json(deletedExpense);
    } catch (error) {
      logger.error(`ExpenseController.deleteExpense() have error:\n${error}`);
      next(error);
    }
  }
}

module.exports = ExpenseController;
