import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { requireRole } from "../middlewares/roleGuard.js";
import { requireApprovedProfile } from "../middlewares/profileStatusGuard.js";
import documentUpload from "../middlewares/documentUpload.js";
import {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
} from "../controllers/event.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, requireApprovedProfile, listEvents);
router.get("/:id", isAuthenticated, requireApprovedProfile, getEvent);
router.post(
  "/",
  isAuthenticated,
  requireRole("FACULTY", "ADMIN", "SUPER_ADMIN"),
  requireApprovedProfile,
  documentUpload.single("cover"),
  createEvent,
);
router.put(
  "/:id",
  isAuthenticated,
  requireRole("FACULTY", "ADMIN", "SUPER_ADMIN"),
  requireApprovedProfile,
  documentUpload.single("cover"),
  updateEvent,
);
router.delete(
  "/:id",
  isAuthenticated,
  requireRole("FACULTY", "ADMIN", "SUPER_ADMIN"),
  requireApprovedProfile,
  deleteEvent,
);
router.post("/:id/register", isAuthenticated, requireApprovedProfile, registerForEvent);

export default router;

