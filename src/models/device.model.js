import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastSeen: { type: Date },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true },
);

export const Device = mongoose.model("Device", deviceSchema);
