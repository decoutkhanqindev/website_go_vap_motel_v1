// Notification.js (Đã cải thiện)
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
      ],
      default: "payment_reminder"
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    relatedDocumentId: {
      type: ObjectId, // ObjectId tham chiếu đến document liên quan (ví dụ: invoiceId, contractId, roomId, ...)
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
