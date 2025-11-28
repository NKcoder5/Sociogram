import prisma from "../utils/prisma.js";
import { loadCurrentUser } from "../middlewares/roleGuard.js";

const buildAnnouncementFilter = (user) => {
  return {
    OR: [
      { scope: "COLLEGE" },
      user.departmentId ? { scope: "DEPARTMENT", departmentId: user.departmentId } : undefined,
      user.classId ? { scope: "CLASS", classId: user.classId } : undefined,
    ].filter(Boolean),
  };
};

export const getStudentDashboard = async (req, res) => {
  try {
    const user = await loadCurrentUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const [announcements, events, materials, posts] = await Promise.all([
      prisma.announcement.findMany({
        where: buildAnnouncementFilter(user),
        orderBy: { publishedAt: "desc" },
        take: 5,
      }),
      prisma.event.findMany({
        where: {
          OR: [
            { departmentId: user.departmentId },
            { classId: user.classId },
            { departmentId: null, classId: null },
          ],
          startAt: { gte: new Date() },
        },
        orderBy: { startAt: "asc" },
        take: 5,
      }),
      prisma.material.findMany({
        where: {
          OR: [
            { departmentId: user.departmentId },
            { classId: user.classId },
            { departmentId: null, classId: null },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.post.findMany({
        where: {
          OR: [
            { audience: "PUBLIC" },
            { audience: "COLLEGE" },
            { audience: "DEPARTMENT", departmentId: user.departmentId },
            { audience: "CLASS", classId: user.classId },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          author: { select: { id: true, username: true, profilePicture: true } },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        announcements,
        events,
        materials,
        posts,
      },
    });
  } catch (error) {
    console.error("Student dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load student dashboard",
    });
  }
};

export const getFacultyDashboard = async (req, res) => {
  try {
    const user = await loadCurrentUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const [announcements, events, materials, pendingApprovals] = await Promise.all([
      prisma.announcement.findMany({
        where: buildAnnouncementFilter(user),
        orderBy: { publishedAt: "desc" },
        take: 5,
      }),
      prisma.event.findMany({
        where: {
          createdById: user.id,
        },
        orderBy: { startAt: "desc" },
        take: 5,
      }),
      prisma.material.findMany({
        where: { createdById: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.user.count({
        where: { profileStatus: "PENDING", departmentId: user.departmentId },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        announcements,
        events,
        materials,
        pendingApprovals,
      },
    });
  } catch (error) {
    console.error("Faculty dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load faculty dashboard",
    });
  }
};

