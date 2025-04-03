const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const electricitySchema = new Schema(
  {
    oldIndex: { type: Number, min: 0, required: true },
    newIndex: { type: Number, min: 0, required: true },
    pricePerUnit: { type: Number, min: 0, required: true },
    amount: { type: Number, min: 0, required: false }
  },
  { _id: false }
);

const waterSchema = new Schema(
  {
    oldIndex: { type: Number, min: 0, required: true },
    newIndex: { type: Number, min: 0, required: true },
    pricePerUnit: { type: Number, min: 0, required: true },
    amount: { type: Number, min: 0, required: false }
  },
  { _id: false }
);

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
    electricity: { type: electricitySchema, required: true },
    water: { type: waterSchema, required: true },
    utilities: [
      {
        type: ObjectId,
        ref: "Utility"
      }
    ],
    // discount: {
    //   type: Number,
    //   required: false,
    //   min: 0
    // },
    totalAmount: {
      type: Number,
      required: false,
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
