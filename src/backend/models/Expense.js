const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const expenseSchema = new Schema(
  {
    roomId: {
      type: ObjectId,
      required: true,
      ref: "Room",
      index: true
    },
    expenseCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    expenseDate: {
      type: Date,
      required: true
    },
    dueDate: {
      type: Date,
      index: true,
      required: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
      enum: ["repair", "maintenance", "purchase"],
      default: "repair"
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentStatus: {
      type: String,
      required: true,
      index: true,
      enum: ["pending", "paid", "overdue"],
      default: "pending"
    },
    paymentMethod: {
      type: String,
      required: false,
      index: true,
      enum: ["all", "cash", "banking"],
      default: "all"
    },
    paymentDate: {
      type: Date,
      required: false,
      index: true
    },
    receiptImages: [
      {
        type: ObjectId,
        ref: "ExpenseImage"
      }
    ],
    description: {
      type: String,
      required: false,
      trim: true,
      default: ""
    }
  },
  {
    collection: "expenses",
    versionKey: false,
    timestamps: true
  }
);

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
