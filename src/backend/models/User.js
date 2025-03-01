const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    role: {
      type: String,
      required: true,
      trim: true,
      enum: ["landlord", "tenant"]
      // ex: tenant
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
      // ex: userGV1029
    },
    password: {
      type: String,
      required: true
      // ex: 1230490 => asjjdt29915j
    },
    phone: {
      type: String,
      required: false,
      trim: true
      // ex: 08xxxxxxxx
    }
  },
  {
    collection: "users",
    versionKey: false,
    timestamps: true // create createdAt and updatedAt automatically
  }
);

userSchema.index({ username: 1 }, { unique: true }); // Index for username for faster login lookups

const User = mongoose.model("User", userSchema);

module.exports = User;
