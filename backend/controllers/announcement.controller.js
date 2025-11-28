import prisma from "../utils/prisma.js";
import { loadCurrentUser } from "../middlewares/roleGuard.js";

const ensureAuthorOrAdmin = (user, entity) => {
  if (!entity) return false;
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") return true;
  return entity.authorId === user.id;
};

export const createAnnouncement = async (req, res) => {
  try {
    const user = await loadCurrentUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (!["ADMIN", "SUPER_ADMIN", "FACULTY"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only faculty or admins can create announcements",
      });
    }

    const { title, content, scope = "COLLEGE", departmentId, classId, attachments = [] } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    if (scope === "DEPARTMENT" && !departmentId) {
      return res.status(400).json({
        success: false,
        message: "Department ID is required for department announcements",
      });
    }

    if (scope === "CLASS" && !classId) {
      return res.status(400).json({
        success: false,
        message: "Class ID is required for class announcements",
      });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        scope,
        attachments,
        authorId: user.id,
        departmentId: departmentId || null,
        classId: classId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create announcement",
    });
  }
};

export const listAnnouncements = async (req, res) => {
  try {
    const { scope, departmentId, classId, limit = 20 } = req.query;

    const where = {};
    if (scope) where.scope = scope;
    if (departmentId) where.departmentId = departmentId;
    if (classId) where.classId = classId;

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: Number(limit),
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
            role: true,
          },
        },
        department: {
          select: { id: true, name: true, code: true },
        },
        classSection: {
          select: { id: true, name: true, code: true, section: true },
        },
      },
    });

    return res.json({
      success: true,
      announcements,
    });
  } catch (error) {
    console.error("List announcements error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load announcements",
    });
  }
};

export const getAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, profilePicture: true, role: true } },
        department: { select: { id: true, name: true, code: true } },
        classSection: { select: { id: true, name: true, code: true, section: true } },
      },
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    return res.json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error("Get announcement error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load announcement",
    });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const user = await loadCurrentUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    const { id } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    if (!ensureAuthorOrAdmin(user, announcement)) {
      return res.status(403).json({
        success: false,
        message: "You cannot modify this announcement",
      });
    }

    const { title, content, scope, departmentId, classId, attachments } = req.body;

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        content,
        scope,
        departmentId: departmentId ?? announcement.departmentId,
        classId: classId ?? announcement.classId,
        attachments: attachments ?? announcement.attachments,
      },
    });

    return res.json({
      success: true,
      announcement: updated,
    });
  } catch (error) {
    console.error("Update announcement error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update announcement",
    });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const user = await loadCurrentUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    const { id } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    if (!ensureAuthorOrAdmin(user, announcement)) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this announcement",
      });
    }

    await prisma.announcement.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Announcement deleted",
    });
  } catch (error) {
    console.error("Delete announcement error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete announcement",
    });
  }
};

