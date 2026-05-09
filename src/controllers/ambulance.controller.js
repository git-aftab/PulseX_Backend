import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Ambulance } from "../models/ambulance.model.js";

export const registerAmbulance = asyncHandler(async (req, res) => {
  const { vehicleNumber, driverLicenseNumber, hospitalId, deviceId } = req.body;

  if (!vehicleNumber || !driverLicenseNumber) {
    throw new ApiError(400, "vehicleNumber and driverLicenseNumber are required");
  }

  const ambulance = await Ambulance.create({
    user: req.user._id,
    vehicleNumber,
    driverLicenseNumber,
    hospital: hospitalId,
    deviceId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, ambulance, "Ambulance registered"));
});

export const updateLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { lng, lat, availabilityStatus } = req.body;

  if (!lng || !lat) {
    throw new ApiError(400, "lng and lat are required");
  }

  const ambulance = await Ambulance.findById(id);
  if (!ambulance) throw new ApiError(404, "Ambulance not found");

  // ownership check
  if (ambulance.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, "Forbidden");
  }

  ambulance.currentLocation = { type: "Point", coordinates: [lng, lat] };
  if (availabilityStatus) ambulance.availabilityStatus = availabilityStatus;
  ambulance.lastActiveAt = Date.now();

  await ambulance.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, ambulance, "Location updated"));
});

export const getMyAmbulance = asyncHandler(async (req, res) => {
  const ambulance = await Ambulance.findOne({ user: req.user._id });
  if (!ambulance) throw new ApiError(404, "Ambulance not found");
  return res.status(200).json(new ApiResponse(200, ambulance, "OK"));
});

export const acceptIncident = asyncHandler(async (req, res) => {
  // placeholder - real assignment happens in incident controller
  const { id } = req.params; // ambulance id
  const ambulance = await Ambulance.findById(id);
  if (!ambulance) throw new ApiError(404, "Ambulance not found");
  if (ambulance.user.toString() !== req.user._id.toString()) throw new ApiError(403, "Forbidden");

  ambulance.availabilityStatus = "BUSY";
  await ambulance.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, ambulance, "Accepted incident"));
});