const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const reqairRequestSchema = new Schema(
  {
    roomId: {
      type: ObjectId,
      required: true,
      ref: "Room",
      index: true
    },
    tenantId: {
      type: ObjectId,
      required: true,
      ref: "User",
      index: true
    },
    requestDate: {
      type: Date,
      required: true,
      index: true
    },
    description: {
      type: String,
      required: false,
      default: ""
    },
    images: [
      {
        type: ObjectId,
        ref: "RepairRequestImage"
      }
    ],
    status: {
      type: String,
      required: true,
      index: true,
      enum: ["pending", "accepted", "rejected"]
    }
  },
  {
    collection: "repairRequests",
    versionKey: false,
    timestamps: true
  }
);

const RepairRequest = mongoose.model("RepairRequest", reqairRequestSchema);

module.exports = RepairRequest;
