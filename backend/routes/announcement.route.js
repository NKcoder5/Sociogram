import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { requireRole } from "../middlewares/roleGuard.js";
import { requireApprovedProfile } from "../middlewares/profileStatusGuard.js";
import {
  createAnnouncement,
  listAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcement.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, requireApprovedProfile, listAnnouncements);
router.get("/:id", isAuthenticated, requireApprovedProfile, getAnnouncement);
router.post(
  "/",
  isAuthenticated,
  requireRole("FACULTY", "ADMIN", "SUPER_ADMIN"),
  requireApprovedProfile,
  createAnnouncement,
);
router.put(
  "/:id",
  isAuthenticated,
  requireRole("FACULTY", "ADMIN", "SUPER_ADMIN"),
  requireApprovedProfile,
  updateAnnouncement,
);
router.delete(
  "/:id",
  isAuthenticated,
  requireRole("FACULTY", "ADMIN", "SUPER_ADMIN"),
  requireApprovedProfile,
  deleteAnnouncement,
);

export default router;

