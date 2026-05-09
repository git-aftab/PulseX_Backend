import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deviceId: { type: String, default: "" },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    status: {
      type: String,
      enum: ["PENDING", "ASSIGNED", "RESOLVED", "CANCELLED"],
      default: "PENDING",
    },
    vitals: {
      heartRate: Number,
      spo2: Number,
      others: Object,
    },
    assignedAmbulance: { type: mongoose.Schema.Types.ObjectId, ref: "Ambulance" },
    assignedHospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  },
  { timestamps: true }
);

incidentSchema.index({ location: "2dsphere" });

export const Incident = mongoose.model("Incident", incidentSchema);