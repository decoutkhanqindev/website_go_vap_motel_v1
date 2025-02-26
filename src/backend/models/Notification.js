const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const notificationSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      ref: "User",
      required: true
      // ex: user201
    },
    type: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "payment_reminder",
        "contract_renewal",
        "repair_request",
        "room_vacancy",
        "general_notification"
      ]
      // ex: general_notification
    },
    message: {
      type: String,
      required: true,
      trim: true
      // ex: loss water at 29/02/2025
    },
    isRead: {
      type: Boolean,
      default: false
      // ex: true
    },
    readAt: {
      type: Date,
      required: false
    }
  },
  {
    collection: "notifications",
    versionKey: false,
    timestamps: true // create createdAt and updatedAt automatically
  }
);

// Indexes for efficient querying
notificationSchema.index({ userId: 1 }); // Index for userId to quickly find notifications for a user
notificationSchema.index({ isRead: 1 }); // Index for isRead status to filter read/unread notifications
notificationSchema.index({ userId: 1, isRead: 1 }); // Compound index for common queries like "unread notifications for a user"

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
