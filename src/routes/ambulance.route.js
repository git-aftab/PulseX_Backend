import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  registerAmbulance,
  updateLocation,
  getMyAmbulance,
  acceptIncident,
} from "../controllers/ambulance.controller.js";

const router = Router();

router.post("/register", verifyJWT, authorizeRoles("ambulance_driver", "admin"), registerAmbulance);
router.get("/me", verifyJWT, authorizeRoles("ambulance_driver", "admin"), getMyAmbulance);
router.patch("/:id/location", verifyJWT, authorizeRoles("ambulance_driver", "admin"), updateLocation);
router.post("/:id/accept", verifyJWT, authorizeRoles("ambulance_driver"), acceptIncident);

export default router;