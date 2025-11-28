import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { requireRole } from "../middlewares/roleGuard.js";
import { requireApprovedProfile } from "../middlewares/profileStatusGuard.js";
import documentUpload from "../middlewares/documentUpload.js";
import {
  uploadMaterial,
  listMaterials,
  getMaterial,
  deleteMaterial,
  addMaterialComment,
} from "../controllers/material.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, requireApprovedProfile, listMaterials);
router.get("/:id", isAuthenticated, requireApprovedProfile, getMaterial);
router.post(
  "/",
  isAuthenticated,
  requireRole("FACULTY", "ADMIN", "SUPER_ADMIN"),
  requireApprovedProfile,
  documentUpload.single("file"),
  uploadMaterial,
);
router.delete(
  "/:id",
  isAuthenticated,
  requireRole("FACULTY", "ADMIN", "SUPER_ADMIN"),
  requireApprovedProfile,
  deleteMaterial,
);
router.post("/:id/comments", isAuthenticated, requireApprovedProfile, addMaterialComment);

export default router;

