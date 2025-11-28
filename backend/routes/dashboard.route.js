import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { requireRole } from "../middlewares/roleGuard.js";
import { requireApprovedProfile } from "../middlewares/profileStatusGuard.js";
import { getStudentDashboard, getFacultyDashboard } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get(
  "/student",
  isAuthenticated,
  requireRole("STUDENT"),
  requireApprovedProfile,
  getStudentDashboard,
);
router.get(
  "/faculty",
  isAuthenticated,
  requireRole("FACULTY", "ADMIN", "SUPER_ADMIN"),
  requireApprovedProfile,
  getFacultyDashboard,
);

export default router;

