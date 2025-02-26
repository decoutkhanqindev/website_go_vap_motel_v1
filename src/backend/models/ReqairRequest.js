const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const reqairRequestSchema = new Schema(
  {
    roomId: {
      type: ObjectId,
      required: true
      // ex: 101
    },
    requestDate: {
      type: Date,
      required: true
      // ex: 08/03/2025
    },
    description: {
      type: String,
      required: false,
      default: ""
      // ex: abc
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => {
          if (!v) return true; // allow empty array (no images initially)
          return v.every((url) =>
            /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
              url
            )
          ); // basic URL validation
        },
        message: (props) => `${props.value} contains invalid URLs!`
      }
      // ex: https://firebasestorage.googleapis.com/v0/b/the-journal-app-46172.appspot.com/o/journal_images%2Fmy_images1718031648?alt=media&token=45022f29-ef85-47ba-bb47-be2bd48df82f
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "accepted", "rejected"]
      // ex: pending
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
