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
    contractCode: {
      type: String,
      required: true,
      ref: "Contract",
      index: true
    },
    fullname: {
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
