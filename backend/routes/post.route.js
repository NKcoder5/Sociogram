import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { addComment, addNewPost, bookmarkPost, deletePost, dislikePost, getAllPost, getCommentsOfPost, getUserPost, getUserPostById, getUserPostByUsername, likePost, testPostCreation } from "../controllers/post.controller.js";
import upload, { handleMulterError } from "../middlewares/multer.js";
import { requireApprovedProfile } from "../middlewares/profileStatusGuard.js";

const router=express.Router();

// Test endpoint for debugging
router.post("/test", isAuthenticated, requireApprovedProfile, upload.single('image'), handleMulterError, testPostCreation);
router.post("/addpost", isAuthenticated, requireApprovedProfile, upload.single('image'), handleMulterError, addNewPost);
router.get("/all", isAuthenticated, requireApprovedProfile, getAllPost);
router.get("/userpost/all", isAuthenticated, requireApprovedProfile, getUserPost);
router.get("/userpost/:userId", isAuthenticated, requireApprovedProfile, getUserPostById);
router.get("/userpost/username/:username", isAuthenticated, requireApprovedProfile, getUserPostByUsername);
router.get("/:id/like", isAuthenticated, requireApprovedProfile, likePost);
router.get("/:id/dislike", isAuthenticated, requireApprovedProfile, dislikePost);
router.post("/:id/comment", isAuthenticated, requireApprovedProfile, addComment); 
router.get("/:id/comment/all", isAuthenticated, requireApprovedProfile, getCommentsOfPost);
router.delete("/delete/:id", isAuthenticated, requireApprovedProfile, deletePost);
router.get("/:id/bookmark", isAuthenticated, requireApprovedProfile, bookmarkPost);

export default router;