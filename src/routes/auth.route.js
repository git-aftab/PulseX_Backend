import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// ==============================
// AUTH ROUTES
// ==============================

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-access-token", refreshAccessToken);
router.post("/logout", logoutUser);
router.get("/me", verifyJWT, getCurrentUser);

export default router;