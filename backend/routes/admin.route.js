import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { requireRole } from "../middlewares/roleGuard.js";
import { requireApprovedProfile } from "../middlewares/profileStatusGuard.js";
import {
  getPendingUsers,
  approveUser,
  rejectUser,
  updateUserRole,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  createClassSection,
  updateClassSection,
  deleteClassSection,
  getAdminDashboard,
} from "../controllers/admin.controller.js";

const router = express.Router();
const adminOnly = [isAuthenticated, requireRole("ADMIN", "SUPER_ADMIN"), requireApprovedProfile];

router.get("/pending-users", ...adminOnly, getPendingUsers);
router.post("/users/:id/approve", ...adminOnly, approveUser);
router.post("/users/:id/reject", ...adminOnly, rejectUser);
router.post("/users/:id/role", ...adminOnly, updateUserRole);

router.get("/dashboard/metrics", ...adminOnly, getAdminDashboard);

router.post("/departments", ...adminOnly, createDepartment);
router.put("/departments/:id", ...adminOnly, updateDepartment);
router.delete("/departments/:id", ...adminOnly, deleteDepartment);

router.post("/classes", ...adminOnly, createClassSection);
router.put("/classes/:id", ...adminOnly, updateClassSection);
router.delete("/classes/:id", ...adminOnly, deleteClassSection);

export default router;

