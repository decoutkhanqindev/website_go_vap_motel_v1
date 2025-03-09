const moment = require("moment-timezone");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const contractSchema = new Schema(
  {
    contractCode: {
      type: String,
      required: false,
      index: true
    },
    roomId: {
      type: ObjectId,
      required: true,
      ref: "Room",
      index: true
    },
    // tenantId: {
    //   type: ObjectId,
    //   required: true,
    //   ref: "User"
    // },
    // occupants: [
    //   {
    //     type: ObjectId,
    //     ref: "Occupant"
    //   }
    // ],
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    rentPrice: {
      type: Number,
      required: true
    },
    deposit: {
      type: Number,
      required: true
    },
    // term: {
    //   type: String,
    //   required: true
    // },
    status: {
      type: String,
      required: true,
      index: true,
      enum: ["active", "expired", "terminated"]
    }
  },
  {
    collection: "contracts",
    versionKey: false,
    timestamps: true
  }
);

const Contract = mongoose.model("Contract", contractSchema);

module.exports = Contract;
