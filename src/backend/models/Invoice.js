const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const invoiceSchema = new Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
      // ex: HDP + roomId + issueDate = HDP + 101 + 22022025
    },
    roomId: {
      type: ObjectId,
      ref: "Room",
      required: true
      // ex: 101
    },
    contractCode: {
      type: ObjectId,
      ref: "Contract",
      required: true
    },
    issueDate: {
      type: Date,
      required: true
      // ex: 25/02/2025
    },
    dueDate: {
      type: Date,
      required: true
      // ex: 01/03/2025
    },
    rentAmount: {
      type: Number,
      required: true
      // ex: 2.500.000 VND
    },
    electricity: {
      oldIndex: Number,
      newIndex: Number,
      pricePerUnit: Number,
      amount: Number,
      required: false,
      min: 0
      // ex: oldIndex: 8353, newIndex: 8509, pricePerUnit: 4.000₫/Kwh, amount = (8509 - 8353) x 4
    },
    water: {
      oldIndex: Number,
      newIndex: Number,
      pricePerUnit: Number,
      amount: Number,
      required: false,
      min: 0
      // ex: oldIndex: 8353, newIndex: 8509, pricePerUnit: 25.000₫/m3, amount = (8509 - 8353) x 25
    },
    otherFees: [
      {
        type: ObjectId,
        ref: "Utility"
      }
      // ex: [wifi: 80.000 VND / month]
    ],
    discount: {
      type: Number,
      required: false,
      min: 0
      // ex: 10%
    },
    totalAmount: {
      type: Number,
      required: false,
      min: 0
      // ex: 2.512.200 VND
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "paid", "overdue"]
      // ex: pending
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "bank transfer"]
    },
    paymentDate: {
      type: Date,
      required: false
      // ex: 27/02/2025
    },
    notes: {
      type: String,
      required: false,
      default: ""
      // ex: no discount for this month
    }
  },
  {
    collection: "invoices",
    versionKey: false,
    timestamps: true // create createdAt and updatedAt automatically
  }
);

// index for filtering invoices by invoiceNumber (ex: HDP1022502025)
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });

// index for filtering invoices by paymentStatus (ex: find all invoices are overdue)
invoiceSchema.index({ paymentStatus: 1 });

// infex for filtering invoices by roomId (ex: find all invoices of room 101)
invoiceSchema.index({ roomId: 1 });

// index for filtering invoices by paymentDate (ex: find all invoices have payment date at 27/02/2025)
invoiceSchema.index({ paymentDate: 1 });

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
