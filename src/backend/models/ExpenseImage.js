const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const expenseImageSchema = new Schema(
  {
    expenseId: {
      type: ObjectId,
      ref: "Expense",
      required: true,
      index: true
    },
    data: {
      type: buffer,
      required: true
    },
    contentType: {
      type: String,
      required: true
    }
  },
  {
    collection: "expenseImages",
    versionKey: false,
    timestamps: true
  }
);

const ExpenseImage = mongoose.model("ExpenseImage", expenseImageSchema);

module.exports = ExpenseImage;
