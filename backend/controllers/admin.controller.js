import prisma from "../utils/prisma.js";

export const getPendingUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { profileStatus: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        departmentId: true,
        classId: true,
        year: true,
        createdAt: true,
      },
    });

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get pending users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending users",
    });
  }
};

export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, departmentId, classId, year } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        profileStatus: "APPROVED",
        role: role || undefined,
        departmentId: departmentId || undefined,
        classId: classId || undefined,
        year: year || undefined,
      },
    });

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Approve user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve user",
    });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.update({
      where: { id },
      data: {
        profileStatus: "SUSPENDED",
      },
    });

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Reject user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject user",
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Update user role error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user role",
    });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, code, description, headId } = req.body;
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Name and code are required",
      });
    }

    const department = await prisma.department.create({
      data: { name, code, description, headId },
    });

    return res.status(201).json({
      success: true,
      department,
    });
  } catch (error) {
    console.error("Create department error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Department code already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create department",
    });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await prisma.department.update({
      where: { id },
      data: req.body,
    });

    return res.json({
      success: true,
      department,
    });
  } catch (error) {
    console.error("Update department error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update department",
    });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.department.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Department removed",
    });
  } catch (error) {
    console.error("Delete department error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete department",
    });
  }
};

export const createClassSection = async (req, res) => {
  try {
    const { name, code, departmentId, year, section, semester, advisorId } = req.body;
    if (!name || !code || !departmentId) {
      return res.status(400).json({
        success: false,
        message: "Name, code, and department are required",
      });
    }

    const classSection = await prisma.classSection.create({
      data: {
        name,
        code,
        departmentId,
        year,
        section,
        semester: semester ? Number(semester) : null,
        advisorId,
      },
    });

    return res.status(201).json({
      success: true,
      classSection,
    });
  } catch (error) {
    console.error("Create class error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Class code already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create class",
    });
  }
};

export const updateClassSection = async (req, res) => {
  try {
    const { id } = req.params;
    const classSection = await prisma.classSection.update({
      where: { id },
      data: req.body,
    });

    return res.json({
      success: true,
      classSection,
    });
  } catch (error) {
    console.error("Update class error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update class",
    });
  }
};

export const deleteClassSection = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.classSection.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Class removed",
    });
  } catch (error) {
    console.error("Delete class error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete class",
    });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const [userCounts, eventCounts, pendingApprovals] = await Promise.all([
      prisma.user.groupBy({
        by: ["role"],
        _count: { _all: true },
      }),
      prisma.event.count(),
      prisma.user.count({ where: { profileStatus: "PENDING" } }),
    ]);

    return res.json({
      success: true,
      metrics: {
        userCounts,
        totalEvents: eventCounts,
        pendingApprovals,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard",
    });
  }
};

