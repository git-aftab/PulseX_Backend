import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Hospital } from "../models/hospital.model.js";

export const registerHospital = asyncHandler(async (req, res) => {
  const { hospitalName, registrationNumber, coordinates, contactNumber, traumaLevel } = req.body;

  if (!hospitalName || !registrationNumber || !coordinates) {
    throw new ApiError(400, "hospitalName, registrationNumber and coordinates are required");
  }

  const hospital = await Hospital.create({
    user: req.user._id,
    hospitalName,
    registrationNumber,
    location: { type: "Point", coordinates },
    contactNumber,
    traumaLevel,
  });

  return res.status(201).json(new ApiResponse(201, hospital, "Hospital registered"));
});

export const getNearbyHospitals = asyncHandler(async (req, res) => {
  const { lng, lat, radius = 5000 } = req.query; // radius in meters
  if (!lng || !lat) throw new ApiError(400, "lng and lat are required");

  const hospitals = await Hospital.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseInt(radius, 10),
      },
    },
  }).limit(50);

  return res.status(200).json(new ApiResponse(200, hospitals, "OK"));
});

export const getMyHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findOne({ user: req.user._id });
  if (!hospital) throw new ApiError(404, "Hospital not found");
  return res.status(200).json(new ApiResponse(200, hospital, "OK"));
});