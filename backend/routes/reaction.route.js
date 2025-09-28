import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { Reaction } from "../models/reaction.model.js";
import { Post } from "../models/post.model.js";

const router = express.Router();

// Add or update reaction to a post
router.post("/react/:postId", isAuthenticated, async (req, res) => {
    try {
        const { postId } = req.params;
        const { reactionType } = req.body;
        const userId = req.id;

        // Validate reaction type
        const validReactions = ['like', 'laugh', 'wow', 'sad', 'thumbs'];
        if (!validReactions.includes(reactionType)) {
            return res.status(400).json({
                message: "Invalid reaction type",
                success: false
            });
        }

        // Check if post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false
            });
        }

        // Check if user already reacted to this post
        const existingReaction = await Reaction.findOne({ userId, postId });

        if (existingReaction) {
            if (existingReaction.type === reactionType) {
                // Same reaction - remove it (toggle off)
                await Reaction.findByIdAndDelete(existingReaction._id);
                
                // Get updated reactions
                const allReactions = await Reaction.find({ postId });
                const reactionCounts = {};
                allReactions.forEach(reaction => {
                    reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
                });

                return res.status(200).json({
                    message: "Reaction removed",
                    success: true,
                    reactions: reactionCounts,
                    userReaction: null
                });
            } else {
                // Different reaction - update it
                existingReaction.type = reactionType;
                await existingReaction.save();
            }
        } else {
            // No existing reaction - create new one
            await Reaction.create({
                userId,
                postId,
                type: reactionType
            });
        }

        // Get updated reactions with counts
        const allReactions = await Reaction.find({ postId });
        const reactionCounts = {};
        allReactions.forEach(reaction => {
            reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
        });

        return res.status(200).json({
            message: "Reaction updated",
            success: true,
            reactions: reactionCounts,
            userReaction: reactionType
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
});

// Get reactions for a post
router.get("/reactions/:postId", async (req, res) => {
    try {
        const { postId } = req.params;

        const reactions = await Reaction.find({ postId })
            .populate('userId', 'username profilePicture')
            .sort({ createdAt: -1 });

        const reactionCounts = {};
        reactions.forEach(reaction => {
            reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
        });

        return res.status(200).json({
            message: "Reactions retrieved successfully",
            success: true,
            reactions: reactionCounts,
            detailedReactions: reactions
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
});

export default router;