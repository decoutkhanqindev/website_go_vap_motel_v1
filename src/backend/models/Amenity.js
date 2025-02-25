const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const amenitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: [
        "bed",
        "refrigerator",
        "air conditioner",
        "water heater",
        "table and chairs",
        "electric stove",
        "gas stove",
        "fan"
      ]
      // ex: refrigerator, bed, ...
    },
    description: {
      type: String,
      required: false,
      trim: true,
      default: ""
      // ex: bed have 1m6 x 2m
    },
    price: {
      type: Number,
      required: true,
      min: 0
      // note: when the user chooses to add amenities, the price will be added to the rent price.
      // ex: 500.000 VND
    }
  },
  {
    collection: "amenities",
    versionKey: false,
    timestamps: true // create createdAt and updatedAt automatically
  }
);

const Amenity = mongoose.model("Amenity", amenitySchema);

module.exports = Amenity;
