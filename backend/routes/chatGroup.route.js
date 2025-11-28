import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { requireApprovedProfile } from "../middlewares/profileStatusGuard.js";
import { joinDepartmentChat, joinClassChat, listAutoGroups } from "../controllers/chatGroup.controller.js";

const router = express.Router();

router.use(isAuthenticated, requireApprovedProfile);

router.post("/department/join", joinDepartmentChat);
router.post("/class/join", joinClassChat);
router.get("/", listAutoGroups);

export default router;

