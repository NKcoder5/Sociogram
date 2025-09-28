import express from "express";
import {
    createGroup,
    getUserGroups,
    addMemberToGroup,
    removeMemberFromGroup,
    updateGroupInfo,
    deleteGroup,
    makeAdmin,
    removeAdmin
} from "../controllers/group.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Create a new group
router.post('/create', isAuthenticated, createGroup);

// Get user's groups
router.get('/my-groups', isAuthenticated, getUserGroups);

// Add member to group
router.post('/:groupId/add-member', isAuthenticated, addMemberToGroup);

// Remove member from group
router.post('/:groupId/remove-member', isAuthenticated, removeMemberFromGroup);

// Update group info
router.put('/:groupId/update', isAuthenticated, updateGroupInfo);

// Delete group
router.delete('/:groupId/delete', isAuthenticated, deleteGroup);

// Make user admin
router.post('/:groupId/make-admin', isAuthenticated, makeAdmin);

// Remove admin
router.post('/:groupId/remove-admin', isAuthenticated, removeAdmin);

export default router;
