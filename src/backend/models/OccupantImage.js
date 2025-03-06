const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const occupantImageSchema = new Schema(
  {
    occupantId: {
      type: ObjectId,
      ref: "Occupant",
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
    collection: "occupantImages",
    versionKey: false,
    timestamps: true
  }
);

const OccupantImage = mongoose.model("OccupantImage", occupantImageSchema);

module.exports = OccupantImage;
