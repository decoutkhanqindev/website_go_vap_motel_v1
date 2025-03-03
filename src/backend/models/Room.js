const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const roomSchema = new Schema(
  {
    // roomCode: {
    //   // Business Key (ví dụ: "RM-101", "ROOM-A-001"...)
    //   type: String,
    //   required: true,
    //   unique: true,
    //   trim: true
    // },
    roomNumber: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      required: true,
      trim: true,
      enum: ["vacant", "occupied", "unavailable"],
      default: "vacant"
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    rentPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    area: {
      type: String,
      required: true,
      trim: true
    },
    maxOccupants: {
      type: Number,
      required: false,
      min: 1,
      integer: true,
      default: 1
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => {
          if (!v) return true;
          return v.every((url) =>
            /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
              url
            )
          );
        },
        message: (props) => `${props.value} contains invalid URLs!`
      }
    },
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
