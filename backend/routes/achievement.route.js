import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { requireRole } from "../middlewares/roleGuard.js";
import { requireApprovedProfile } from "../middlewares/profileStatusGuard.js";
import documentUpload from "../middlewares/documentUpload.js";
import {
  createAchievement,
  listAchievements,
  verifyAchievement,
  deleteAchievement,
} from "../controllers/achievement.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, requireApprovedProfile, listAchievements);
router.post(
  "/",
  isAuthenticated,
  requireRole("STUDENT"),
  requireApprovedProfile,
  documentUpload.fields([
    { name: "media", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
  ]),
  createAchievement,
);
router.post(
  "/:id/verify",
  isAuthenticated,
  requireRole("FACULTY", "ADMIN", "SUPER_ADMIN"),
  requireApprovedProfile,
  verifyAchievement,
);
router.delete(
  "/:id",
  isAuthenticated,
  requireRole("STUDENT", "ADMIN", "SUPER_ADMIN"),
  requireApprovedProfile,
  deleteAchievement,
);

export default router;

