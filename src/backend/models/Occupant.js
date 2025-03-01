const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const occupantSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true
    },
    birthday: {
      type: Date,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    cccd: {
      type: String,
      required: true
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
    }
  },
  {
    collection: "occupants",
    versionKey: false,
    timestamps: true // create createdAt and updatedAt automatically
  }
);
