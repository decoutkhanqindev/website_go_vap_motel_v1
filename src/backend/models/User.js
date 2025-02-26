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
    },
    fullName: {
      type: String,
      required: false,
      trim: true
      // ex: nguyen van a
    },
    cccd: {
      type: String,
      required: false,
      trim: true
      // CCCD/CMND (cho người thuê)
    },
    cccdImages: {
      type: [String],
      trim: true,
      validate: {
        validator: (url) => {
          if (!url) return true;
          return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
            url
          );
        },
        message: (props) => `${props.value} is not a valid URL!`
      }
    },
    emergencyContact: {
      name: {
        type: String,
        required: false,
        trim: true
      },
      phone: {
        type: String,
        required: false,
        trim: true
      },
      relationship: {
        type: String,
        required: false,
        trim: true
      }
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
