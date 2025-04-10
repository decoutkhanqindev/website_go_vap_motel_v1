const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    role: {
      type: String,
      required: true,
      trim: true,
      index: true,
      enum: ["landlord", "tenant"],
      default: "tenant"
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    }
  },
  {
    collection: "users",
    versionKey: false,
    timestamps: true
  }
);

const refreshTokenSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    data: {
      type: String,
      required: true,
      unique: true,
      index: true
    }
  },
  {
    collection: "refreshTokens",
    versionKey: false,
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);
const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

module.exports = { User, RefreshToken };
