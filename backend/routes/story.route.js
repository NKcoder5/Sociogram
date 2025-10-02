import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload, { handleMulterError } from "../middlewares/multer.js";
import { 
  createStory, 
  getStories, 
  getUserStories,
  markStoryAsViewed,
  deleteStory 
} from "../controllers/story.controller.js";

const router = express.Router();

// Create a new story
router.post("/create", isAuthenticated, upload.single('media'), handleMulterError, createStory);

// Get all stories from followed users
router.get("/all", isAuthenticated, getStories);

// Get specific user's stories
router.get("/user/:userId", isAuthenticated, getUserStories);

// Mark story as viewed
router.post("/:storyId/view", isAuthenticated, markStoryAsViewed);

// Delete own story
router.delete("/:storyId", isAuthenticated, deleteStory);

export default router;
