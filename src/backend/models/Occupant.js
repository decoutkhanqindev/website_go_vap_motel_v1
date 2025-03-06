const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const occupantSchema = new Schema(
  {
    // occupantCode: {
    //   // Business Key (ví dụ: "OCC-2023-001", "TENANT-SUB-001"...)
    //   type: String,
    //   required: true,
    //   unique: true,
    //   trim: true
    // },
    roomId: {
      type: ObjectId,
      required: true,
      ref: "Room",
      index: true
    },
    contractCode: {
      type: String,
      required: true,
      ref: "Contract",
      index: true
    },
    fullName: {
      type: String,
      required: true
    },
    birthday: {
      type: Date,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    cccd: {
      type: String,
      required: true
    },
    cccdImages: [
      {
        type: ObjectId,
        ref: "OccupantImage"
      }
    ]
  },
  {
    collection: "occupants",
    versionKey: false,
    timestamps: true
  }
);

const Occupant = mongoose.model("Occupant", occupantSchema);

module.exports = Occupant;
