import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Incident } from "../models/incident.model.js";
import { Ambulance } from "../models/ambulance.model.js";
import { Hospital } from "../models/hospital.model.js";
import { findNearestAvailableHospital } from "../services/hospital.service.js";

// create incident (user/device)
export const createIncident = asyncHandler(async (req, res) => {
  const { lng, lat, deviceId, vitals } = req.body;
  if (typeof lng === "undefined" || typeof lat === "undefined") throw new ApiError(400, "lng and lat are required");

  const incident = await Incident.create({
    reporter: req.user?._id,
    deviceId,
    location: { type: "Point", coordinates: [lng, lat] },
    vitals,
  });

  // attempt to assign nearest available hospital
  try {
    const hospital = await findNearestAvailableHospital(lng, lat);
    if (hospital) {
      incident.assignedHospital = hospital._id;
      await incident.save({ validateBeforeSave: false });

      // decrement bed count if possible
      if (typeof hospital.availableBeds === 'number') {
        hospital.availableBeds = Math.max(0, hospital.availableBeds - 1);
        if (hospital.availableBeds <= 0) hospital.hospitalCapacityStatus = "FULL";
        else if (hospital.availableBeds <= 2) hospital.hospitalCapacityStatus = "LIMITED";
        await hospital.save({ validateBeforeSave: false });
      }
    }
  } catch (err) {
    // log but don't block incident creation
    console.error("Hospital assignment failed", err);
  }

  return res.status(201).json(new ApiResponse(201, incident, "Incident created"));
});

// list nearby incidents for ambulance drivers
export const listNearbyIncidents = asyncHandler(async (req, res) => {
  const { lng, lat, radius = 10000 } = req.query;
  if (!lng || !lat) throw new ApiError(400, "lng and lat are required");

  const incidents = await Incident.find({
    status: "PENDING",
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseInt(radius, 10),
      },
    },
  }).limit(50);

  return res.status(200).json(new ApiResponse(200, incidents, "OK"));
});

// ambulance accepts incident (dispatch locking)
export const acceptIncident = asyncHandler(async (req, res) => {
  const { id } = req.params; // incident id
  const ambulance = await Ambulance.findOne({ user: req.user._id });
  if (!ambulance) throw new ApiError(404, "Ambulance not found for user");

  // atomic update: only assign if still pending and no assignedAmbulance
  const updated = await Incident.findOneAndUpdate(
    { _id: id, status: "PENDING", assignedAmbulance: { $exists: false } },
    { $set: { assignedAmbulance: ambulance._id, status: "ASSIGNED" } },
    { new: true },
  );

  if (!updated) {
    throw new ApiError(409, "Incident already assigned or not available");
  }

  // mark ambulance busy
  ambulance.availabilityStatus = "BUSY";
  await ambulance.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, updated, "Incident assigned"));
});

export const resolveIncident = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const incident = await Incident.findById(id);
  if (!incident) throw new ApiError(404, "Incident not found");

  // only assigned ambulance or admin can resolve
  const ambulance = await Ambulance.findOne({ user: req.user._id });
  if (req.user.role !== 'admin' && (!ambulance || incident.assignedAmbulance?.toString() !== ambulance._id.toString())) {
    throw new ApiError(403, "Forbidden");
  }

  incident.status = "RESOLVED";
  await incident.save({ validateBeforeSave: false });

  // free ambulance
  if (ambulance) {
    ambulance.availabilityStatus = "AVAILABLE";
    await ambulance.save({ validateBeforeSave: false });
  }

  return res.status(200).json(new ApiResponse(200, incident, "Incident resolved"));
});