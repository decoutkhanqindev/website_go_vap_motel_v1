const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const occupantSchema = new Schema(
  {
    roomId: {
      type: ObjectId,
      required: true,
      ref: "Room",
      index: true
    },
    tenantId: {
      type: ObjectId,
      ref: "User",
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
    },
    birthday: {
      type: Date,
    },
    address: {
      type: String,
    },
    // phone: {
    //   type: String,
    //   required: true
    // },
    cccd: {
      type: String,
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
