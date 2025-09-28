import { PrismaClient } from '@prisma/client';
import { getSocketInstance } from '../config/socket.js';

const prisma = new PrismaClient();

// Create a new group
export const createGroup = async (req, res) => {
    try {
        const { name, description, participants, settings } = req.body;
        const userId = req.id;

        if (!name || !participants || participants.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Group name and participants are required"
            });
        }

        // Validate participants exist
        const validParticipants = await prisma.user.findMany({
            where: { id: { in: participants } },
            select: { id: true, username: true, profilePicture: true }
        });

        if (validParticipants.length !== participants.length) {
            return res.status(400).json({
                success: false,
                message: "Some participants not found"
            });
        }

        // Create group conversation with transaction
        const groupConversation = await prisma.conversation.create({
            data: {
                name: name,
                description: description || null,
                isGroup: true,
                groupOwnerId: userId,
                participants: {
                    create: [userId, ...participants].map(participantId => ({
                        userId: participantId
                    }))
                },
                groupAdmins: {
                    create: {
                        userId: userId
                    }
                },
                groupSettings: {
                    create: {
                        isPrivate: settings?.isPrivate || false,
                        allowMemberInvites: settings?.allowMemberInvites || true,
                        requireApproval: settings?.requireApproval || false,
                        muteNotifications: settings?.muteNotifications || false
                    }
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, username: true, profilePicture: true }
                        }
                    }
                },
                groupOwner: {
                    select: { id: true, username: true, profilePicture: true }
                },
                groupAdmins: {
                    include: {
                        user: {
                            select: { id: true, username: true, profilePicture: true }
                        }
                    }
                },
                groupSettings: true
            }
        });

        // Emit socket event for real-time updates
        try {
            const io = getSocketInstance();
            const participantIds = [userId, ...participants];
            io.emit('groupCreated', { 
                group: groupConversation, 
                participantIds 
            });
        } catch (socketError) {
            console.error('Socket emission error:', socketError);
        }

        res.status(201).json({
            success: true,
            message: "Group created successfully",
            group: groupConversation
        });

    } catch (error) {
        console.error("Create group error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get user's groups
export const getUserGroups = async (req, res) => {
    try {
        const userId = req.id;

        const groups = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: { userId: userId }
                },
                isGroup: true
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, username: true, profilePicture: true }
                        }
                    }
                },
                groupOwner: {
                    select: { id: true, username: true, profilePicture: true }
                },
                groupAdmins: {
                    include: {
                        user: {
                            select: { id: true, username: true, profilePicture: true }
                        }
                    }
                },
                groupSettings: true,
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: {
                        sender: {
                            select: { id: true, username: true, profilePicture: true }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Transform to include lastMessage
        const transformedGroups = groups.map(group => ({
            ...group,
            lastMessage: group.messages[0] || null,
            messages: undefined
        }));

        res.status(200).json({
            success: true,
            groups: transformedGroups
        });

    } catch (error) {
        console.error("Get user groups error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Add member to group
export const addMemberToGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId: newMemberId } = req.body;
        const currentUserId = req.id;

        const group = await prisma.conversation.findUnique({
            where: { id: groupId },
            include: {
                participants: true,
                groupOwner: true,
                groupAdmins: true,
                groupSettings: true
            }
        });

        if (!group || !group.isGroup) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // Check if user has permission to add members
        const isOwner = group.groupOwnerId === currentUserId;
        const isAdmin = group.groupAdmins.some(admin => admin.userId === currentUserId);
        const canAddMembers = isOwner || isAdmin || group.groupSettings?.allowMemberInvites;

        if (!canAddMembers) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to add members"
            });
        }

        // Check if user is already a member
        const isAlreadyMember = group.participants.some(p => p.userId === newMemberId);
        if (isAlreadyMember) {
            return res.status(400).json({
                success: false,
                message: "User is already a member"
            });
        }

        // Add member
        await prisma.conversationParticipant.create({
            data: {
                conversationId: groupId,
                userId: newMemberId
            }
        });

        // Create system message
        await prisma.message.create({
            data: {
                content: `User added to the group`,
                senderId: currentUserId,
                conversationId: groupId,
                messageType: 'system'
            }
        });

        // Get updated group with all relations
        const updatedGroup = await prisma.conversation.findUnique({
            where: { id: groupId },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, username: true, profilePicture: true }
                        }
                    }
                },
                groupOwner: {
                    select: { id: true, username: true, profilePicture: true }
                },
                groupAdmins: {
                    include: {
                        user: {
                            select: { id: true, username: true, profilePicture: true }
                        }
                    }
                },
                groupSettings: true
            }
        });

        // Emit socket event
        try {
            const io = getSocketInstance();
            const participantIds = updatedGroup.participants.map(p => p.userId);
            io.emit('memberAdded', { 
                group: updatedGroup, 
                newMemberId,
                participantIds 
            });
        } catch (socketError) {
            console.error('Socket emission error:', socketError);
        }

        res.status(200).json({
            success: true,
            message: "Member added successfully",
            group: updatedGroup
        });

    } catch (error) {
        console.error("Add member error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Remove member from group
export const removeMemberFromGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId: memberToRemove } = req.body;
        const currentUserId = req.id;

        const group = await Conversation.findById(groupId);
        if (!group || !group.isGroupChat) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // Check permissions
        const isOwner = group.groupOwner.equals(currentUserId);
        const isAdmin = group.groupAdmin.includes(currentUserId);
        const isSelf = currentUserId === memberToRemove;

        if (!isOwner && !isAdmin && !isSelf) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to remove this member"
            });
        }

        // Can't remove owner
        if (group.groupOwner.equals(memberToRemove) && !isSelf) {
            return res.status(403).json({
                success: false,
                message: "Cannot remove group owner"
            });
        }

        // Remove member
        group.participants = group.participants.filter(p => !p.equals(memberToRemove));
        group.groupAdmin = group.groupAdmin.filter(a => !a.equals(memberToRemove));
        await group.save();

        // Create system message
        const systemMessage = new Message({
            content: isSelf ? `User left the group` : `User was removed from the group`,
            senderId: currentUserId,
            conversationId: groupId,
            messageType: 'system'
        });
        await systemMessage.save();

        const populatedGroup = await Conversation.findById(groupId)
            .populate('participants', 'username profilePicture')
            .populate('groupOwner', 'username profilePicture')
            .populate('groupAdmin', 'username profilePicture');

        res.status(200).json({
            success: true,
            message: isSelf ? "Left group successfully" : "Member removed successfully",
            group: populatedGroup
        });

    } catch (error) {
        console.error("Remove member error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Update group info
export const updateGroupInfo = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, description, settings } = req.body;
        const currentUserId = req.id;

        const group = await Conversation.findById(groupId);
        if (!group || !group.isGroupChat) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // Check permissions
        const isOwner = group.groupOwner.equals(currentUserId);
        const isAdmin = group.groupAdmin.includes(currentUserId);

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to update group info"
            });
        }

        // Update group info
        if (name) group.groupName = name;
        if (description !== undefined) group.groupDescription = description;
        if (settings) {
            group.groupSettings = { ...group.groupSettings, ...settings };
        }

        await group.save();

        const populatedGroup = await Conversation.findById(groupId)
            .populate('participants', 'username profilePicture')
            .populate('groupOwner', 'username profilePicture')
            .populate('groupAdmin', 'username profilePicture');

        res.status(200).json({
            success: true,
            message: "Group updated successfully",
            group: populatedGroup
        });

    } catch (error) {
        console.error("Update group error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Delete group
export const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const currentUserId = req.id;

        const group = await prisma.conversation.findUnique({
            where: { id: groupId },
            include: {
                participants: true,
                groupOwner: true
            }
        });

        if (!group || !group.isGroup) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // Only owner can delete group
        if (group.groupOwnerId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: "Only group owner can delete the group"
            });
        }

        // Get participant IDs for socket emission
        const participantIds = group.participants.map(p => p.userId);

        // Delete the group (cascade will handle related records)
        await prisma.conversation.delete({
            where: { id: groupId }
        });

        // Emit socket event
        try {
            const io = getSocketInstance();
            io.emit('groupDeleted', { 
                groupId,
                participantIds 
            });
        } catch (socketError) {
            console.error('Socket emission error:', socketError);
        }

        res.status(200).json({
            success: true,
            message: "Group deleted successfully"
        });

    } catch (error) {
        console.error("Delete group error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Make user admin
export const makeAdmin = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId: newAdminId } = req.body;
        const currentUserId = req.id;

        const group = await Conversation.findById(groupId);
        if (!group || !group.isGroupChat) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // Only owner can make admins
        if (!group.groupOwner.equals(currentUserId)) {
            return res.status(403).json({
                success: false,
                message: "Only group owner can make admins"
            });
        }

        // Check if user is a member
        if (!group.participants.includes(newAdminId)) {
            return res.status(400).json({
                success: false,
                message: "User is not a member of this group"
            });
        }

        // Add to admin list if not already admin
        if (!group.groupAdmin.includes(newAdminId)) {
            group.groupAdmin.push(newAdminId);
            await group.save();
        }

        const populatedGroup = await Conversation.findById(groupId)
            .populate('participants', 'username profilePicture')
            .populate('groupOwner', 'username profilePicture')
            .populate('groupAdmin', 'username profilePicture');

        res.status(200).json({
            success: true,
            message: "User promoted to admin",
            group: populatedGroup
        });

    } catch (error) {
        console.error("Make admin error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Remove admin
export const removeAdmin = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId: adminToRemove } = req.body;
        const currentUserId = req.id;

        const group = await Conversation.findById(groupId);
        if (!group || !group.isGroupChat) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // Only owner can remove admins
        if (!group.groupOwner.equals(currentUserId)) {
            return res.status(403).json({
                success: false,
                message: "Only group owner can remove admins"
            });
        }

        // Can't remove owner from admin
        if (group.groupOwner.equals(adminToRemove)) {
            return res.status(400).json({
                success: false,
                message: "Cannot remove owner from admin role"
            });
        }

        // Remove from admin list
        group.groupAdmin = group.groupAdmin.filter(a => !a.equals(adminToRemove));
        await group.save();

        const populatedGroup = await Conversation.findById(groupId)
            .populate('participants', 'username profilePicture')
            .populate('groupOwner', 'username profilePicture')
            .populate('groupAdmin', 'username profilePicture');

        res.status(200).json({
            success: true,
            message: "Admin role removed",
            group: populatedGroup
        });

    } catch (error) {
        console.error("Remove admin error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
