import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { createIncident, listNearbyIncidents, acceptIncident, resolveIncident, getActiveIncidents, cancelIncident } from "../controllers/incident.controller.js";

const router = Router();

// users/devices can create incidents (allow authenticated users for now)
router.post("/", verifyJWT, createIncident);

// list active incidents (PENDING or ASSIGNED)
router.get("/active", verifyJWT, authorizeRoles("ambulance_driver", "police", "hospital", "admin"), getActiveIncidents);

// ambulance drivers can list nearby pending incidents
router.get("/nearby", verifyJWT, authorizeRoles("ambulance_driver"), listNearbyIncidents);

// ambulance accepts incident
router.post("/:id/accept", verifyJWT, authorizeRoles("ambulance_driver"), acceptIncident);

// resolve
router.post("/:id/resolve", verifyJWT, authorizeRoles("ambulance_driver", "admin"), resolveIncident);

// cancel incident
router.patch("/:id/cancel", verifyJWT, cancelIncident);

export default router;