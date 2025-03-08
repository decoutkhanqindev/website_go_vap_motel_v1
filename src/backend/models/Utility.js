const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const utilitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: ["wifi", "parking", "cleaning"],
      index: true
    },
    description: {
      type: String,
      required: false,
      trim: true,
      default: ""
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    images: [
      {
        type: ObjectId,
        ref: "UtilityImage"
      }
    ]
  },
  {
    collection: "utilities",
    versionKey: false,
    timestamps: true
  }
);

const Utility = mongoose.model("Utility", utilitySchema);

module.exports = Utility;
