const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const invoiceSchema = new Schema(
  {
    invoiceCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    roomId: {
      type: ObjectId,
      required: true,
      index: true,
      ref: "Room"
    },
    // contractCode: {
    //   type: String,
    //   required: true,
    //   ref: "Contract"
    // },
    issueDate: {
      type: Date,
      index: true,
      required: true
    },
    dueDate: {
      type: Date,
      index: true,
      required: true
    },
    rentAmount: {
      type: Number,
      required: true
    },
    electricity: {
      oldIndex: Number,
      newIndex: Number,
      pricePerUnit: Number,
      amount: Number,
      required: false,
      min: 0
    },
    water: {
      oldIndex: Number,
      newIndex: Number,
      pricePerUnit: Number,
      amount: Number,
      required: false,
      min: 0
    },
    utilities: [
      {
        type: ObjectId,
        ref: "Utility"
      }
    ],
    discount: {
      type: Number,
      required: false,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: false,
      min: 0
    },
    paymentStatus: {
      type: String,
      required: true,
      index: true,
      enum: ["pending", "paid", "overdue"]
    },
    paymentMethod: {
      type: String,
      required: true,
      index: true,
      enum: ["cash", "bank transfer"]
    },
    paymentDate: {
      type: Date,
      required: false,
      index: true
    },
    notes: {
      type: String,
      required: false,
      default: ""
    }
  },
  {
    collection: "invoices",
    versionKey: false,
    timestamps: true
  }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
