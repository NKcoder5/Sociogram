import prisma from "../utils/prisma.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { loadCurrentUser } from "../middlewares/roleGuard.js";

const uploadCoverImage = async (file) => {
  if (!file) return null;
  const fileUri = getDataUri(file);
  const response = await cloudinary.uploader.upload(fileUri, {
    folder: "college-events",
    resource_type: "auto",
  });
  return response.secure_url;
};

export const createEvent = async (req, res) => {
  try {
    const user = await loadCurrentUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (!["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only faculty or admins can create events",
      });
    }

    const {
      title,
      description,
      eventType = "OTHER",
      startAt,
      endAt,
      location,
      capacity,
      registrationDeadline,
      departmentId,
      classId,
      clubId,
    } = req.body;

    if (!title || !startAt || !endAt) {
      return res.status(400).json({
        success: false,
        message: "Title, start date, and end date are required",
      });
    }

    const coverImage = await uploadCoverImage(req.file);

    const event = await prisma.event.create({
      data: {
        title,
        description,
        eventType,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        location,
        capacity: capacity ? Number(capacity) : null,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        coverImage,
        createdById: user.id,
        departmentId: departmentId || user.departmentId || null,
        classId: classId || null,
        clubId: clubId || null,
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
        classSection: { select: { id: true, name: true, code: true } },
        club: { select: { id: true, name: true } },
      },
    });

    return res.status(201).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
};

export const listEvents = async (req, res) => {
  try {
    const { scope, departmentId, classId, clubId, upcoming = "true" } = req.query;
    const where = {};

    if (departmentId) where.departmentId = departmentId;
    if (classId) where.classId = classId;
    if (clubId) where.clubId = clubId;

    if (upcoming === "true") {
      where.startAt = { gte: new Date() };
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startAt: "asc" },
      include: {
        createdBy: { select: { id: true, username: true, profilePicture: true, role: true } },
        department: { select: { id: true, name: true, code: true } },
        classSection: { select: { id: true, name: true, code: true, section: true } },
        club: { select: { id: true, name: true } },
        _count: { select: { registrations: true } },
      },
    });

    return res.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("List events error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load events",
    });
  }
};

export const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, username: true, profilePicture: true, role: true } },
        department: { select: { id: true, name: true, code: true } },
        classSection: { select: { id: true, name: true, code: true, section: true } },
        club: { select: { id: true, name: true } },
        registrations: {
          include: {
            attendee: { select: { id: true, username: true, profilePicture: true, role: true } },
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Get event error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load event",
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const user = await loadCurrentUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const { id } = req.params;
    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role) && event.createdById !== user.id) {
      return res.status(403).json({
        success: false,
        message: "You cannot modify this event",
      });
    }

    const coverImage = await uploadCoverImage(req.file);

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...req.body,
        startAt: req.body.startAt ? new Date(req.body.startAt) : event.startAt,
        endAt: req.body.endAt ? new Date(req.body.endAt) : event.endAt,
        registrationDeadline: req.body.registrationDeadline
          ? new Date(req.body.registrationDeadline)
          : event.registrationDeadline,
        coverImage: coverImage || event.coverImage,
      },
    });

    return res.json({
      success: true,
      event: updated,
    });
  } catch (error) {
    console.error("Update event error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update event",
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const user = await loadCurrentUser(req);
    const { id } = req.params;
    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!user || (!["ADMIN", "SUPER_ADMIN"].includes(user.role) && event.createdById !== user.id)) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this event",
      });
    }

    await prisma.event.delete({ where: { id } });

    return res.json({
      success: true,
      message: "Event deleted",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete event",
    });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    const user = await loadCurrentUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: { _count: { select: { registrations: true } } },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Registration deadline has passed",
      });
    }

    if (event.capacity && event._count.registrations >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: "Event is full",
      });
    }

    const registration = await prisma.eventRegistration.upsert({
      where: {
        eventId_userId: {
          eventId: id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        eventId: id,
        userId: user.id,
      },
    });

    return res.json({
      success: true,
      registration,
    });
  } catch (error) {
    console.error("Register for event error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to register for event",
    });
  }
};

