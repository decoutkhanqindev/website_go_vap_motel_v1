const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const roomSchema = new Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    status: {
      type: String,
      required: true,
      trim: true,
      index: true,
      enum: ["vacant", "occupied", "unavailable"],
      default: "vacant"
    },
    address: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    rentPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    occupantsNumber: {
      type: Number,
      required: true,
      min: 1,
      integer: true,
      default: 1
    },
    images: [
      {
        type: ObjectId,
        ref: "RoomImage"
      }
    ],
    amenities: [
      {
        type: ObjectId,
        ref: "Amenity"
      }
    ],
    utilities: [
      {
        type: ObjectId,
        ref: "Utility"
      }
    ],
    description: {
      type: String,
      required: false,
      trim: true,
      default: ""
    }
  },
  {
    collection: "rooms",
    versionKey: false,
    timestamps: true
  }
);

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
