import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { addComment, addNewPost, bookmarkPost, deletePost, dislikePost, getAllPost, getCommentsOfPost, getUserPost, likePost, testPostCreation } from "../controllers/post.controller.js";
import upload, { handleMulterError } from "../middlewares/multer.js";

const router=express.Router();

// Test endpoint for debugging
router.post("/test", isAuthenticated, upload.single('image'), handleMulterError, testPostCreation);
router.post("/addpost", isAuthenticated, upload.single('image'), handleMulterError, addNewPost);
router.get("/all", isAuthenticated, getAllPost);
router.get("/userpost/all", isAuthenticated, getUserPost);
router.get("/:id/like", isAuthenticated, likePost);
router.get("/:id/dislike", isAuthenticated, dislikePost);
router.post("/:id/comment", isAuthenticated, addComment); 
router.get("/:id/comment/all", isAuthenticated, getCommentsOfPost);
router.delete("/delete/:id", isAuthenticated, deletePost);
router.get("/:id/bookmark", isAuthenticated, bookmarkPost);

export default router;