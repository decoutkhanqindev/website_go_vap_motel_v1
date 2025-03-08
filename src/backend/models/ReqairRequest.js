const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const reqairRequestSchema = new Schema(
  {
    // repairRequestCode: {
    //   // Business Key (ví dụ: "REQ-2023-001", "RR-12345"...)
    //   type: String,
    //   required: true,
    //   unique: true,
    //   trim: true
    // },
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
