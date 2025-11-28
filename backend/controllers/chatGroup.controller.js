import prisma from "../utils/prisma.js";
import { loadCurrentUser } from "../middlewares/roleGuard.js";

const ensureDepartmentConversation = async (departmentId, name) => {
  let conversation = await prisma.conversation.findFirst({
    where: { scope: "DEPARTMENT", departmentId },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        name,
        scope: "DEPARTMENT",
        departmentId,
        isGroup: true,
        autoManaged: true,
      },
    });
  }

  return conversation;
};

const ensureClassConversation = async (classId, name) => {
  let conversation = await prisma.conversation.findFirst({
    where: { scope: "CLASS", classId },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        name,
        scope: "CLASS",
        classId,
        isGroup: true,
        autoManaged: true,
      },
    });
  }

  return conversation;
};

const ensureMembership = async (conversationId, userId) => {
  await prisma.conversationParticipant.upsert({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
    update: {},
    create: {
      conversationId,
      userId,
    },
  });
};

export const joinDepartmentChat = async (req, res) => {
  try {
    const user = await loadCurrentUser(req);
    if (!user || !user.departmentId) {
      return res.status(400).json({
        success: false,
        message: "Department chat is not available without a department assignment",
      });
    }

    const department = await prisma.department.findUnique({
      where: { id: user.departmentId },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const conversation = await ensureDepartmentConversation(department.id, `${department.name} Department`);
    await ensureMembership(conversation.id, user.id);

    return res.json({
      success: true,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Join department chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to join department chat",
    });
  }
};

export const joinClassChat = async (req, res) => {
  try {
    const user = await loadCurrentUser(req);
    if (!user || !user.classId) {
      return res.status(400).json({
        success: false,
        message: "Class chat is not available without a class assignment",
      });
    }

    const classSection = await prisma.classSection.findUnique({
      where: { id: user.classId },
    });

    if (!classSection) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const conversation = await ensureClassConversation(
      classSection.id,
      `${classSection.name} ${classSection.section || ""}`.trim(),
    );
    await ensureMembership(conversation.id, user.id);

    return res.json({
      success: true,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Join class chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to join class chat",
    });
  }
};

export const listAutoGroups = async (req, res) => {
  try {
    const user = await loadCurrentUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        autoManaged: true,
        participants: {
          some: {
            userId: user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        scope: true,
        departmentId: true,
        classId: true,
        updatedAt: true,
      },
    });

    return res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("List chat groups error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load chat groups",
    });
  }
};

