const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const utilitySchema = new Schema(
  {
    // utilityCode: {
    //   // Business Key (ví dụ: "WIFI-001", "PARK-001"...)
    //   type: String,
    //   required: true,
    //   unique: true,
    //   trim: true
    // },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: ["wifi", "parking", "cleaning"]
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
