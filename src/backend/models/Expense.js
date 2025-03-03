const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
        type: String,
        required: true,
        trim: true,
        validate: {
          validator: (url) => {
            if (!url) return true;
            return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
              url
            );
          },
          message: (props) => `${props.value} is not a valid URL!`
        }
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
