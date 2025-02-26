const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const utilitySchema = new Schema(
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
      // ex: each utility will be paid monthly.
    },
    price: {
      type: Number,
      required: true,
      min: 0
      // ex: 100.000 VND / month
    }
  },
  {
    collection: "utilities",
    versionKey: false,
    timestamps: true // create createdAt and updatedAt automatically
  }
);

const Utility = mongoose.model("Utility", utilitySchema);

module.exports = Utility;
