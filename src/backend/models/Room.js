const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const roomSchema = new Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      // unique: true,
      trim: true
      // ex: 101, 102, ...
    },
    status: {
      type: String,
      required: true,
      trim: true,
      enum: ["vacant", "occupied", "unavailable"],
      default: "vacant"
      // ex: occupied
    },
    address: {
      type: String,
      required: true,
      trim: true
      // note: landlord can have more than one property/area
      // ex: Floor 3, 12 Nguyen Van Bao, ...; Floor 3, 9 Phan Huy Ich, ...
    },
    rentPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0
      // ex: 2.500.000 VND / month
    },
    area: {
      type: String,
      required: true,
      trim: true
      // ex: 12m x 7m
    },
    maxOccupants: {
      type: Number,
      required: false,
      min: 1,
      integer: true,
      default: 1
      // ex: 4
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => {
          if (!v) return true; // allow empty array (no images initially)
          return v.every((url) =>
            /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
              url
            )
          ); // basic URL validation
        },
        message: (props) => `${props.value} contains invalid URLs!`
      }
      // ex: https://firebasestorage.googleapis.com/v0/b/the-journal-app-46172.appspot.com/o/journal_images%2Fmy_images1718031648?alt=media&token=45022f29-ef85-47ba-bb47-be2bd48df82f
    },
    amenities: [
      {
        type: ObjectId,
        ref: "Amenity"
      }
      // note: only first month 
      // ex: [refrigerator, bed, ...]
    ],
    utilities: [
      {
        type: ObjectId,
        ref: "Utility"
      }
      // note: every month
      // ex: [Wifi, parking, ...]
    ],
    description: {
      type: String,
      required: false,
      trim: true,
      default: ""
      // ex: "This is a student room near IUH, ..."
    }
  },
  {
    collection: "rooms",
    versionKey: false,
    timestamps: true // create createdAt and updatedAt automatically
  }
);

// index or faster lookups rooms by roomNumber (if you query by room number often)
roomSchema.index({ roomNumber: 1 });

// index filtering rooms by status (ex: find all vacant rooms)
roomSchema.index({ status: 1 });

// index for filtering rooms by address (ex: find all rooms at 12 Nguyen Van Bao)
roomSchema.index({ address: 1 });

// index for filtering rooms by rentPrice (ex: find all rooms within a price range)
roomSchema.index({ rentPrice: 1 });

// compound index for status and rentPrice (ex: find vacant rooms within a price range)
roomSchema.index({ status: 1, rentPrice: 1 });

// compound index for status and address (ex: find vacant rooms at 9 Phan Huy Ich)
roomSchema.index({ status: 1, address: 1 });

// compound index for address and rentPrice (ex: find all rooms at 12 Nguyen Van Bao within a price range)
roomSchema.index({ address: 1, rentPrice: 1 });

// compound index for status, rentPrice, address (ex: find vacant rooms within a price range at 12 Nguyen Van Bao)
roomSchema.index({ status: 1, rentPrice: 1, address: 1 });

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
