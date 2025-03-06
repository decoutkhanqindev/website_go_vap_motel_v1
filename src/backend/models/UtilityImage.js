const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const utilityImageSchema = new Schema(
  {
    utilityId: {
      type: ObjectId,
      ref: "Utility",
      required: true,
      index: true
    },
    data: {
      type: Buffer,
      required: true
    },
    contentType: {
      type: String,
      required: true
    }
  },
  {
    collection: "utilityImages",
    versionKey: false,
    timestamps: true
  }
);

const UtilityImage = mongoose.model("UtilityImage", utilityImageSchema);

module.exports = UtilityImage;
