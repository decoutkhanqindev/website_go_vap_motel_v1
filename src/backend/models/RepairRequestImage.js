const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const repairRequestImageSchema = new Schema(
  {
    repairRequestId: {
      type: ObjectId,
      ref: "RepairRequest",
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
    collection: "repairRequestImages",
    versionKey: false,
    timestamps: true
  }
);

const RepairRequestImage = mongoose.model(
  "RepairRequestImage",
  repairRequestImageSchema
);

module.exports = RepairRequestImage;
