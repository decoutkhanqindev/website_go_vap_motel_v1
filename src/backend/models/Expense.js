const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const expenseSchema = new Schema(
  {
    expenseCode: {
      // Business Key (ví dụ: "EXP-2023-001", "REPAIR-123"...)
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    expenseDate: {
      type: Date,
      required: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ["repair", "maintenance", "purchase"]
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: false,
      trim: true,
      default: ""
    },
    receiptImages: [
      {
        type: ObjectId,
        ref: "ExpenseImage"
      }
    ],
    notes: {
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
