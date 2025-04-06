const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const moment = require("moment-timezone");
const RoomService = require("../services/RoomService");
const Expense = require("../models/Expense");
const ExpenseImage = require("../models/ExpenseImage");

class ExpenseService {
  static async getAllExpenses(filter = {}) {
    try {
      logger.info(`ExpenseService.getAllExpenses() is called.`);
      let query = Expense.find();

      if (filter.roomId) query = query.where("roomId").equals(filter.roomId);
      if (filter.expenseCode)
        query = query.where("expenseCode").equals(filter.expenseCode);
      if (filter.expenseDate)
        query = query.where("expenseDate").equals(filter.expenseDate);
      if (filter.dueDate) query = query.where("dueDate").equals(filter.dueDate);
      if (filter.category)
        query = query.where("category").equals(filter.category);
      if (filter.paymentStatus)
        query = query.where("paymentStatus").equals(filter.paymentStatus);
      if (filter.paymentMethod)
        query = query.where("paymentMethod").equals(filter.paymentMethod);
      if (filter.paymentDate)
        query = query.where("paymentDate").equals(filter.paymentDate);

      const expenses = await query;
      if (!expenses.length) {
        throw new ApiError(404, `No expenses found matching your filter.`);
      }
      return expenses;
    } catch (error) {
      logger.error(`ExpenseService.getAllExpenses() have error:\n${error}`);
      throw error;
    }
  }

  static async getExpenseById(id) {
    try {
      logger.info(`ExpenseService.getExpenseById() is called.`);
      const expense = await Expense.findById(id);
      if (!expense) {
        throw new ApiError(404, `No Expense found matching id ${id}.`);
      }
      return expense;
    } catch (error) {
      logger.info(`ExpenseService.getExpenseById() have error:\n${error}`);
      throw error;
    }
  }

  static async getExpenseReceiptImageById(id) {
    try {
      logger.info("ExpenseService.getExpenseReceiptImageById() is called.");
      const expenseImage = await ExpenseImage.findById(id);
      if (!expenseImage) {
        throw new ApiError(
          404,
          `No expense receipt image found matching id ${id}.`
        );
      }
      return expenseImage;
    } catch (error) {
      logger.error(
        `ExpenseService.getExpenseReceiptImageById() have error:\n${error}`
      );
      throw error;
    }
  }

  static async addNewExpenseReceiptImage(data) {
    try {
      logger.info("ExpenseService.addNewExpenseReceiptImage() is called.");
      const newExpenseImage = new ExpenseImage(data);
      const addedExpenseImage = await newExpenseImage.save();
      return addedExpenseImage;
    } catch (error) {
      logger.error(
        `ExpenseService.addNewExpenseReceiptImage() have error:\n${error}`
      );
      throw error;
    }
  }

  static async deleteExpenseReceiptImage(id) {
    try {
      logger.info("ExpenseService.deleteExpenseReceiptImage() is called.");
      const deletedExpenseImage = await ExpenseImage.findByIdAndDelete(id);
      if (!deletedExpenseImage) {
        throw new ApiError(
          404,
          `No expense receipt image found matching id ${id}.`
        );
      }
      return deletedExpenseImage;
    } catch (error) {
      logger.error(
        `ExpenseService.deleteExpenseReceiptImage() have error:\n${error}`
      );
      throw error;
    }
  }

  static async addReceiptImagesToExpense(id, receiptImageFiles) {
    try {
      logger.info("ExpenseService.addReceiptImagesToExpense() is called.");
      const expense = await Expense.findById(id);
      if (!expense) {
        throw new ApiError(404, `No expense found matching id ${id}.`);
      }

      let newImages = [];
      for (const file of receiptImageFiles) {
        const data = {
          expenseId: id,
          data: file.buffer,
          contentType: file.mimetype
        };
        const addedExpenseImage =
          await ExpenseService.addNewExpenseReceiptImage(data);
        newImages.push(addedExpenseImage._id);
      }

      const updatedExpense = await Expense.findByIdAndUpdate(
        id,
        {
          $push: { receiptImages: { $each: newImages } }
        },
        { new: true }
      );
      return updatedExpense;
    } catch (error) {
      logger.error(
        `ExpenseService.addReceiptImagesToExpense() have error:\n${error}`
      );
      throw error;
    }
  }

  static async deleteReceiptImagesForExpense(id, receiptImageIds) {
    try {
      logger.info("ExpenseService.deleteReceiptImagesForExpense() is called.");
      const expense = await Expense.findById(id);
      if (!expense) {
        throw new ApiError(404, `No expense found matching id ${id}.`);
      }

      for (const imageId of receiptImageIds) {
        await ExpenseService.deleteExpenseReceiptImage(imageId);
      }

      const updatedExpense = await Expense.findByIdAndUpdate(
        id,
        {
          $pull: { receiptImages: { $in: receiptImageIds } }
        },
        { new: true }
      );
      return updatedExpense;
    } catch (error) {
      logger.error(
        `ExpenseService.deleteReceiptImagesForExpense() have error:\n${error}`
      );
      throw error;
    }
  }

  static async generateExpenseCode(roomNumber, expenseDate, dueDate) {
    try {
      logger.info(`ExpenseService.generateExpenseCode() is called.`);
      const formatExpenseDate = moment(expenseDate).format("YYYYMMDD");
      const formatDueDate = moment(dueDate).format("YYYYMMDD");

      const lastExpense = await Expense.findOne().sort({ _id: -1 });
      if (!lastExpense)
        return `${formatExpenseDate}${formatDueDate}${roomNumber}1`;

      const lastExpenseCode = lastExpense.expenseCode;
      const lastExpenseNumber = parseInt(
        lastExpenseCode.slice(
          formatExpenseDate.length + formatDueDate.length + roomNumber.length
        ),
        10
      );

      const newExpenseNumber = lastExpenseNumber + 1;
      const newExpenseCode = `${formatExpenseDate}${formatDueDate}${roomNumber}${newExpenseNumber}`;
      return newExpenseCode;
    } catch (error) {
      logger.info(
        `ExpenseService.generateExpenseCode() has an error:\n${error}`
      );
      throw error;
    }
  }

  static async addNewExpense(data, receiptImageFiles) {
    try {
      logger.info("ExpenseService.addNewExpense() is called.");
      const { roomId, expenseCode, expenseDate, dueDate } = data;

      if (!expenseCode) {
        const room = await RoomService.getRoomById(roomId);
        const roomNumber = room.roomNumber;
        data.expenseCode = await ExpenseService.generateExpenseCode(
          roomNumber,
          expenseDate,
          dueDate
        );
      }

      let newExpense = new Expense(data);
      const addedExpense = await newExpense.save();

      if (
        receiptImageFiles &&
        Array.isArray(receiptImageFiles) &&
        receiptImageFiles.length > 0
      ) {
        newExpense = await ExpenseService.addReceiptImagesToExpense(
          newExpense._id,
          receiptImageFiles
        );
      }

      const updatedExpense = await ExpenseService.getExpenseById(
        addedExpense._id
      );
      return updatedExpense;
    } catch (error) {
      logger.error(`ExpenseService.addNewExpense() have error:\n${error}`);
      throw error;
    }
  }

  static async updateExpense(id, data) {
    try {
      logger.info("ExpenseService.updatedExpense() is called.");
      const updatedExpense = await Expense.findByIdAndUpdate(id, data, {
        new: true
      });
      if (!updatedExpense) {
        throw new ApiError(404, `No expense found matching id ${id}.`);
      }
      return updatedExpense;
    } catch (error) {
      logger.error(`ExpenseService.updatedExpense() have error:\n${error}`);
      throw error;
    }
  }

  static async deleteExpense(id) {
    try {
      logger.info("ExpenseService.deleteExpense() is called.");
      const deletedExpense = await Expense.findByIdAndDelete(id);
      if (!deletedExpense) {
        throw new ApiError(404, `No Expense found matching id ${id}.`);
      }

      let copyExpenseImages = [...deletedExpense.receiptImages];
      if (copyExpenseImages.length > 0) {
        for (const imageId of copyExpenseImages) {
          await ExpenseService.deleteExpenseReceiptImage(imageId);
        }
      }

      return deletedExpense;
    } catch (error) {
      logger.error(`ExpenseService.deleteExpense() have error:\n${error}`);
      throw error;
    }
  }

  static async markExpenseIsPaid(id, paymentMethod) {
    try {
      logger.info("ExpenseService.markExpenseIsPaid() is called.");
      const updatedExpense = await Expense.findByIdAndUpdate(
        id,
        {
          paymentStatus: "paid",
          paymentDate: new Date(),
          paymentMethod: paymentMethod
        },
        {
          new: true
        }
      );
      if (!updatedExpense) {
        throw new ApiError(404, `No expense found matching id ${id}.`);
      }
      return updatedExpense;
    } catch (error) {
      logger.error(`ExpenseService.markExpenseIsPaid() have error:\n${error}`);
      throw error;
    }
  }
}

module.exports = ExpenseService;
