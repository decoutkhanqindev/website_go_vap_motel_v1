const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const contractSchema = new Schema(
  {
    roomId: {
      type: ObjectId,
      required: true,
      ref: "Room"
      // ex: 101
    },
    tenantId: {
      type: ObjectId,
      required: true,
      ref: "User"
      // ex: user119
    },
    occupantIds: [
      {
        type: ObjectId,
        ref: "Occupant"
      }
    ],
    contractCode: {
      type: String,
      required: true,
      unique: true
      // ex: HD + 101 + user101 = HD101119
    },
    startDate: {
      type: Date,
      required: true
      // ex: 26/02/2025
    },
    endDate: {
      type: Date,
      required: true
      // ex: 26/08/2025
    },
    rentPrice: {
      type: Number,
      required: true
      // ex: 3.000.000 VND / month (if tenant need more amenities => 3.000.000 VND + price of amenities for first month)
    },
    deposit: {
      type: true,
      required: true
      // ex: 3.000.000 VND
    },
    term: {
      type: String,
      required: true
      // ex:
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "expired", "terminated"]
      // ex: expired
    }
  },
  {
    collection: "contracts",
    versionKey: false,
    timestamps: true // create createdAt and updatedAt automatically
  }
);

const Contract = mongoose.model("Contract", contractSchema);

module.exports = Contract;
