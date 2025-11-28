import prisma from "../utils/prisma.js";

export const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      include: {
        head: {
          select: { id: true, username: true, profilePicture: true, role: true },
        },
        _count: {
          select: {
            members: true,
            classes: true,
            events: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
    });
  }
};

export const getClasses = async (req, res) => {
  try {
    const { departmentId } = req.query;
    const where = departmentId ? { departmentId } : {};

    const classes = await prisma.classSection.findMany({
      where,
      orderBy: [{ year: "asc" }, { name: "asc" }],
      include: {
        department: { select: { id: true, name: true, code: true } },
        advisor: { select: { id: true, username: true, profilePicture: true, role: true } },
        _count: {
          select: { students: true },
        },
      },
    });

    return res.json({
      success: true,
      classes,
    });
  } catch (error) {
    console.error("Get classes error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch classes",
    });
  }
};

export const getStudents = async (req, res) => {
  try {
    const { departmentId, classId, year, search } = req.query;
    const where = {
      role: "STUDENT",
    };

    if (departmentId) where.departmentId = departmentId;
    if (classId) where.classId = classId;
    if (year) where.year = year;
    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const students = await prisma.user.findMany({
      where,
      orderBy: { username: "asc" },
      select: {
        id: true,
        username: true,
        email: true,
        profilePicture: true,
        department: { select: { id: true, name: true, code: true } },
        classSection: { select: { id: true, name: true, code: true, section: true } },
        year: true,
        profileStatus: true,
      },
    });

    return res.json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("Get students error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};

export const getFaculty = async (req, res) => {
  try {
    const { departmentId, search } = req.query;
    const where = {
      role: "FACULTY",
    };

    if (departmentId) where.departmentId = departmentId;
    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const faculty = await prisma.user.findMany({
      where,
      orderBy: { username: "asc" },
      select: {
        id: true,
        username: true,
        email: true,
        profilePicture: true,
        department: { select: { id: true, name: true, code: true } },
        profileStatus: true,
      },
    });

    return res.json({
      success: true,
      faculty,
    });
  } catch (error) {
    console.error("Get faculty error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch faculty directory",
    });
  }
};

