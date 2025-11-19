import express from "express";
import {editProfile,followOrUnfollow,getProfile,getProfileByUsername,getSuggestedUsers,login,logout,register,getFollowers,getFollowing,uploadProfilePicture,firebaseAuth,getMutualConnections} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router=express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/firebase-auth', firebaseAuth);
router.get('/logout', logout);
router.get('/profile/:id', isAuthenticated, getProfile);
router.get('/profile', isAuthenticated, (req, res) => {
    // For requests without ID, use the authenticated user's ID
    req.params.id = req.id;
    return getProfile(req, res);
});
router.get('/profile/username/:username', isAuthenticated, getProfileByUsername);
router.post('/profile/edit', isAuthenticated, upload.single('profilePicture'), editProfile);
router.post('/profile/picture', isAuthenticated, upload.single('profilePicture'), uploadProfilePicture);
router.get('/suggested', isAuthenticated, getSuggestedUsers);
router.get('/mutual-connections', isAuthenticated, getMutualConnections);
router.post('/followorunfollow/:id', isAuthenticated, followOrUnfollow);
router.get('/:id/followers', isAuthenticated, getFollowers);
router.get('/:id/following', isAuthenticated, getFollowing);

export default router;