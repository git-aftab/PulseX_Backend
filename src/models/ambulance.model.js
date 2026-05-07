import mongoose from "mongoose";

const ambulanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    driverLicenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },

    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
    },

    availabilityStatus: {
      type: String,
      enum: ["AVAILABLE", "BUSY", "OFFLINE", "MAINTENANCE"],
      default: "AVAILABLE",
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    deviceId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

ambulanceSchema.index({ currentLocation: "2dsphere" });

export const Ambulance = mongoose.model("Ambulance", ambulanceSchema);
