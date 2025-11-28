import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { requireApprovedProfile } from "../middlewares/profileStatusGuard.js";
import {
  getDepartments,
  getClasses,
  getStudents,
  getFaculty,
} from "../controllers/directory.controller.js";

const router = express.Router();

router.use(isAuthenticated, requireApprovedProfile);

router.get("/departments", getDepartments);
router.get("/classes", getClasses);
router.get("/students", getStudents);
router.get("/faculty", getFaculty);

export default router;

