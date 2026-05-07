import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    contactNumber: {
      type: String,
      required: true,
    },

    traumaLevel: {
      type: String,
      enum: ["LEVEL_1", "LEVEL_2", "LEVEL_3"],
      default: "LEVEL_3",
    },

    totalBeds: {
      type: Number,
      default: 0,
    },

    availableBeds: {
      type: Number,
      default: 0,
    },

    doctorsAvailable: [
      {
        name: String,
        specialization: String,
        phone: String,
      },
    ],

    hospitalCapacityStatus: {
      type: String,
      enum: ["AVAILABLE", "LIMITED", "FULL", "EMERGENCY_ONLY"],
      default: "AVAILABLE",
    },

    emergencyAvailable: {
      type: Boolean,
      default: true,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

hospitalSchema.index({ location: "2dsphere" });

export const Hospital = mongoose.model("Hospital", hospitalSchema);
