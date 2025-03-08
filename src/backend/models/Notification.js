const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const notificationSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "User",
      index: true
    },
    type: {
      type: String,
      required: true,
      trim: true,
      index: true,
      enum: [
        "payment_reminder",
        "contract_renewal",
        "repair_request",
        "room_vacancy",
        "general_notification"
      ]
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    relatedDocumentId: {
      type: ObjectId, // ObjectId will reference to related (ex: invoiceId, contractCode, roomId, ...)
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      required: false
    }
  },
  {
    collection: "notifications",
    versionKey: false,
    timestamps: true
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
