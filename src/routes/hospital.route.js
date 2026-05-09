import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { registerHospital, getNearbyHospitals, getMyHospital } from "../controllers/hospital.controller.js";

const router = Router();

router.post("/register", verifyJWT, authorizeRoles("hospital", "admin"), registerHospital);
router.get("/nearby", verifyJWT, getNearbyHospitals);
router.get("/me", verifyJWT, authorizeRoles("hospital", "admin"), getMyHospital);

export default router;