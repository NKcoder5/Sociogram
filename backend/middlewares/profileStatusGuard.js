import { loadCurrentUser } from "./roleGuard.js";

export const requireApprovedProfile = async (req, res, next) => {
  try {
    const user = await loadCurrentUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.profileStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Your profile is pending approval. Please contact admin.",
        profileStatus: user.profileStatus,
      });
    }

    next();
  } catch (error) {
    console.error("Profile status guard error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify profile status",
    });
  }
};

export const requireActiveProfile = requireApprovedProfile;

