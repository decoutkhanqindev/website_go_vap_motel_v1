const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const roomImageSchema = new Schema(
  {
    roomId: {
      type: ObjectId,
      ref: "Room",
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
    collection: "roomImages",
    versionKey: false,
    timestamps: true
  }
);

const RoomImage = mongoose.model("RoomImage", roomImageSchema);

module.exports = RoomImage;
