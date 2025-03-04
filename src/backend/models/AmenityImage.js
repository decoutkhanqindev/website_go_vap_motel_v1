const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const amenityImageSchema = new Schema(
  {
    amenityId: {
      type: ObjectId,
      ref: "Amenity",
      required: true
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
    collection: "amenityImages",
    versionKey: false,
    timestamps: true
  }
);

const AmenityImage = mongoose.model("AmenityImage", amenityImageSchema);

module.exports = AmenityImage;
