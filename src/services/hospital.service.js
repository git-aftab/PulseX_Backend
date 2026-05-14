import { Hospital } from "../models/hospital.model.js";
import logger from "../utils/logger.js";

/**
 * Find nearest hospital with available beds and emergencyAvailable=true
 * Returns single hospital doc or null
 */
export const findNearestAvailableHospital = async (lng, lat, maxDistance = 20000) => {
  logger.info(`findNearestAvailableHospital called with lng=${lng}, lat=${lat}, maxDistance=${maxDistance}`);

  if (typeof lng === "undefined" || typeof lat === "undefined") {
    logger.warn("findNearestAvailableHospital missing coordinates");
    return null;
  }

  try {
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

    if (hospitals.length === 0) {
      logger.info("findNearestAvailableHospital: no hospitals found");
      return null;
    }

    const hospital = hospitals[0];
    logger.info(`findNearestAvailableHospital: found hospital ${hospital._id.toString()} with availableBeds=${hospital.availableBeds}`);
    return hospital;
  } catch (err) {
    logger.error("findNearestAvailableHospital error", err);
    return null;
  }
};
