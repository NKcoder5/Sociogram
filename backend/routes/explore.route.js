import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { 
  getExplorePosts, 
  getTrendingHashtags, 
  searchPosts, 
  getExploreUsers,
  getExploreReels 
} from "../controllers/explore.controller.js";

const router = express.Router();

// Get explore posts (trending/popular posts)
router.get("/posts", isAuthenticated, getExplorePosts);

// Get explore reels
router.get("/reels", isAuthenticated, getExploreReels);

// Get trending hashtags
router.get("/hashtags", isAuthenticated, getTrendingHashtags);

// Search posts by query
router.get("/search", isAuthenticated, searchPosts);

// Get explore users (people you might know)
router.get("/users", isAuthenticated, getExploreUsers);

export default router;
