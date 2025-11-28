import prisma from "../utils/prisma.js";

export const loadCurrentUser = async (req) => {
  if (req.currentUser) {
    return req.currentUser;
  }

  if (!req.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.id },
  });

  if (user) {
    req.currentUser = user;
  }

  return user;
};

export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await loadCurrentUser(req);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User account not found for this token",
        });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action",
        });
      }

      next();
    } catch (error) {
      console.error("Role guard error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to authorize user role",
      });
    }
  };
};

export const requireAnyRole = (roles) => requireRole(...roles);

export const requireAdmin = requireRole("ADMIN", "SUPER_ADMIN");
export const requireFaculty = requireRole("FACULTY", "ADMIN", "SUPER_ADMIN");
export const requireStudent = requireRole("STUDENT");

export const attachCurrentUser = async (req, res, next) => {
  try {
    const user = await loadCurrentUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    next();
  } catch (error) {
    console.error("Attach user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load user profile",
    });
  }
};

