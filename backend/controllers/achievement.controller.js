import prisma from "../utils/prisma.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { loadCurrentUser } from "../middlewares/roleGuard.js";

const uploadOptionalFile = async (file, folder) => {
  if (!file) return null;
  const fileUri = getDataUri(file);
  const response = await cloudinary.uploader.upload(fileUri, {
    folder,
    resource_type: "auto",
  });
  return response.secure_url;
};

export const createAchievement = async (req, res) => {
  try {
    const user = await loadCurrentUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (user.role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Only students can submit achievements",
      });
    }

    const { title, description, tags = [], departmentId } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const mediaUrl = await uploadOptionalFile(req.files?.media?.[0], "talent-media");
    const certificateUrl = await uploadOptionalFile(req.files?.certificate?.[0], "talent-certificates");

    const achievement = await prisma.achievement.create({
      data: {
        title,
        description,
        tags: Array.isArray(tags) ? tags : String(tags).split(",").map((tag) => tag.trim()).filter(Boolean),
        mediaUrl,
        certificateUrl,
        userId: user.id,
        departmentId: departmentId || user.departmentId || null,
      },
      include: {
        student: {
          select: { id: true, username: true, profilePicture: true, departmentId: true, classId: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      achievement,
    });
  } catch (error) {
    console.error("Create achievement error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit achievement",
    });
  }
};

export const listAchievements = async (req, res) => {
  try {
    const { userId, departmentId, status, verified } = req.query;
    const where = {};

    if (userId) where.userId = userId;
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;
    if (verified) where.verifiedAt = verified === "true" ? { not: null } : null;

    const achievements = await prisma.achievement.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      include: {
        student: {
          select: { id: true, username: true, profilePicture: true, departmentId: true, classId: true },
        },
        verifier: {
          select: { id: true, username: true, profilePicture: true, role: true },
        },
        department: { select: { id: true, name: true, code: true } },
      },
    });

    return res.json({
      success: true,
      achievements,
    });
  } catch (error) {
    console.error("List achievements error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load achievements",
    });
  }
};

export const verifyAchievement = async (req, res) => {
  try {
    const user = await loadCurrentUser(req);
    if (!user || !["ADMIN", "SUPER_ADMIN", "FACULTY"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only faculty or admins can verify achievements",
      });
    }

    const { id } = req.params;
    const { status = "APPROVED" } = req.body;

    const achievement = await prisma.achievement.update({
      where: { id },
      data: {
        status,
        verifiedAt: new Date(),
        verifiedById: user.id,
      },
      include: {
        student: { select: { id: true, username: true } },
        verifier: { select: { id: true, username: true } },
      },
    });

    return res.json({
      success: true,
      achievement,
    });
  } catch (error) {
    console.error("Verify achievement error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify achievement",
    });
  }
};

export const deleteAchievement = async (req, res) => {
  try {
    const user = await loadCurrentUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const { id } = req.params;
    const achievement = await prisma.achievement.findUnique({ where: { id } });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: "Achievement not found",
      });
    }

    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role) && achievement.userId !== user.id) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this achievement",
      });
    }

    await prisma.achievement.delete({ where: { id } });

    return res.json({
      success: true,
      message: "Achievement removed",
    });
  } catch (error) {
    console.error("Delete achievement error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete achievement",
    });
  }
};

