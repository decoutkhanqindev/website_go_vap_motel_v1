const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomServiceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: ["wifi", "parking", "cleaning"]
      // ex: refrigerator, bed, ...
    },
    description: {
      type: String,
      required: false,
      trim: true,
      default: ""
      // ex: each service will be paid monthly.
    },
    price: {
      type: Number,
      required: true,
      min: 0
      // ex: 100.000 VND / month
    }
  },
  {
    collection: "roomServices",
    versionKey: false,
    timestamps: true // create createdAt and updatedAt automatically
  }
);

const RoomService = mongoose.model("RoomService", roomServiceSchema);

module.exports = RoomService;
