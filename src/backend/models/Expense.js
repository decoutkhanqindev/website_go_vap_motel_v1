const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const expenseSchema = new Schema(
  {
    expenseDate: {
      type: Date,
      required: true
      // ex: 2025-03-10
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ["repair", "maintenance", "purchase"]
      // ex: repair, maintenance, purchase
    },
    amount: {
      type: Number,
      required: true,
      min: 0
      // ex: 1.500.000 VND
    },
    description: {
      type: String,
      required: false,
      trim: true,
      default: ""
      // ex: Repairing broken door in room 101
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
      // ex: Paid in cash, receipt attached
    }
  },
  {
    collection: "expenses",
    versionKey: false,
    timestamps: true // create createdAt and updatedAt automatically
  }
);

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
