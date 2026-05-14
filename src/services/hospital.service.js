import { Hospital } from "../models/hospital.model.js";

/**
 * Find nearest hospital with available beds and emergencyAvailable=true
 * Returns single hospital doc or null
 */
export const findNearestAvailableHospital = async (lng, lat, maxDistance = 20000) => {
  if (typeof lng === "undefined" || typeof lat === "undefined") return null;

  const hospitals = await Hospital.find({
    emergencyAvailable: true,
    availableBeds: { $gt: 0 },
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: maxDistance,
      },
    },
  }).limit(1);

  return hospitals.length > 0 ? hospitals[0] : null;
};
