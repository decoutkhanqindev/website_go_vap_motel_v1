const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    // userCode: {
    //   // Business Key (ví dụ: "LANDLORD-001", "TENANT-001"...)
    //   type: String,
    //   required: true,
    //   unique: true,
    //   trim: true
    // },
    role: {
      type: String,
      required: true,
      trim: true,
      enum: ["landlord", "tenant"]
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: false,
      trim: true
    }
  },
  {
    collection: "users",
    versionKey: false,
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
