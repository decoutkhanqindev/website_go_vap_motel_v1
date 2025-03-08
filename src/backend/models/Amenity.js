const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const amenitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      enum: [
        "bed",
        "refrigerator",
        "air_conditioner",
        "water_heater",
        "table_and_chairs",
        "electric_stove",
        "gas_stove"
      ]
    },
    description: {
      type: String,
      required: false,
      trim: true,
      default: ""
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    images: [
      {
        type: ObjectId,
        ref: "AmenityImage"
      }
    ]
  },
  {
    collection: "amenities",
    versionKey: false,
    timestamps: true
  }
);

const Amenity = mongoose.model("Amenity", amenitySchema);

module.exports = Amenity;
