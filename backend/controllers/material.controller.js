import prisma from "../utils/prisma.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { loadCurrentUser } from "../middlewares/roleGuard.js";

const ensureMaterialAuthorOrAdmin = (user, material) => {
  if (!material) return false;
  if (["ADMIN", "SUPER_ADMIN"].includes(user.role)) return true;
  return material.createdById === user.id;
};

export const uploadMaterial = async (req, res) => {
  try {
    const user = await loadCurrentUser(req);

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (!["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only faculty or admins can upload materials",
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Material file is required",
      });
    }

    const { title, description, subject, semester, type = "NOTE", departmentId, classId, tags = [] } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const fileUri = getDataUri(file);
    const uploadResponse = await cloudinary.uploader.upload(fileUri, {
      folder: "college-materials",
      resource_type: "auto",
    });

    const material = await prisma.material.create({
      data: {
        title,
        description,
        subject,
        semester,
        type,
        tags: Array.isArray(tags) ? tags : String(tags).split(",").map((tag) => tag.trim()).filter(Boolean),
        fileUrl: uploadResponse.secure_url,
        previewUrl: uploadResponse.secure_url,
        createdById: user.id,
        departmentId: departmentId || user.departmentId || null,
        classId: classId || null,
      },
      include: {
        createdBy: {
          select: { id: true, username: true, profilePicture: true, role: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      material,
    });
  } catch (error) {
    console.error("Upload material error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload material",
    });
  }
};

export const listMaterials = async (req, res) => {
  try {
    const { departmentId, classId, subject, semester, type, creatorId, search, limit = 20 } = req.query;
    const where = {};

    if (departmentId) where.departmentId = departmentId;
    if (classId) where.classId = classId;
    if (subject) where.subject = subject;
    if (semester) where.semester = semester;
    if (type) where.type = type;
    if (creatorId) where.createdById = creatorId;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    const materials = await prisma.material.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Number(limit),
      include: {
        createdBy: { select: { id: true, username: true, profilePicture: true, role: true } },
        department: { select: { id: true, name: true, code: true } },
        classSection: { select: { id: true, name: true, code: true, section: true } },
        _count: { select: { comments: true } },
      },
    });

    return res.json({
      success: true,
      materials,
    });
  } catch (error) {
    console.error("List materials error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load materials",
    });
  }
};

export const getMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, username: true, profilePicture: true, role: true } },
        department: { select: { id: true, name: true, code: true } },
        classSection: { select: { id: true, name: true, code: true, section: true } },
        comments: {
          include: {
            author: { select: { id: true, username: true, profilePicture: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    return res.json({
      success: true,
      material,
    });
  } catch (error) {
    console.error("Get material error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load material",
    });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const user = await loadCurrentUser(req);
    const { id } = req.params;

    const material = await prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    if (!user || !ensureMaterialAuthorOrAdmin(user, material)) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this material",
      });
    }

    await prisma.material.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Material removed",
    });
  } catch (error) {
    console.error("Delete material error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete material",
    });
  }
};

export const addMaterialComment = async (req, res) => {
  try {
    const user = await loadCurrentUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const material = await prisma.material.findUnique({ where: { id } });
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    const comment = await prisma.materialComment.create({
      data: {
        text,
        materialId: id,
        authorId: user.id,
      },
      include: {
        author: { select: { id: true, username: true, profilePicture: true } },
      },
    });

    return res.status(201).json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("Add material comment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
};

