import { PrismaClient } from '@prisma/client';
import { getSocketInstance } from "../config/socket.js";
import aiChatService from '../services/aiChat.service.js';

const prisma = new PrismaClient();

// Send message
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { message, file } = req.body;

        console.log('📨 Send message request:', {
            senderId,
            receiverId,
            hasMessage: !!message,
            hasFile: !!file,
            timestamp: new Date().toISOString()
        });

        // Validate required fields
        if (!senderId) {
            console.error('❌ Missing senderId (authentication issue)');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!receiverId) {
            console.error('❌ Missing receiverId in URL params');
            return res.status(400).json({
                success: false,
                message: 'Receiver ID is required'
            });
        }

        if (!message && !file) {
            console.error('❌ Missing message content and file');
            return res.status(400).json({
                success: false,
                message: 'Message content or file is required'
            });
        }

        // Verify both users exist
        const [sender, receiver] = await Promise.all([
            prisma.user.findUnique({ where: { id: senderId } }),
            prisma.user.findUnique({ where: { id: receiverId } })
        ]);

        if (!sender) {
            console.error('❌ Sender not found:', senderId);
            return res.status(404).json({
                success: false,
                message: 'Sender not found'
            });
        }

        if (!receiver) {
            console.error('❌ Receiver not found:', receiverId);
            return res.status(404).json({
                success: false,
                message: 'Receiver not found'
            });
        }

        console.log(`✅ Validated users: ${sender.username} -> ${receiver.username}`);

        // Find existing conversation between these two users
        let conversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    {
                        participants: {
                            some: { userId: senderId }
                        }
                    },
                    {
                        participants: {
                            some: { userId: receiverId }
                        }
                    },
                    { isGroup: false }
                ]
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, username: true, profilePicture: true }
                        }
                    }
                }
            }
        });

        // Create conversation if it doesn't exist
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    isGroup: false,
                    participants: {
                        create: [
                            { userId: senderId },
                            { userId: receiverId }
                        ]
                    }
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: { id: true, username: true, profilePicture: true }
                            }
                        }
                    }
                }
            });
        }

        // Create new message with file support
        const newMessage = await prisma.message.create({
            data: {
                content: message || null,
                senderId,
                receiverId,
                conversationId: conversation.id,
                messageType: file ? 'file' : 'text',
                ...(file && {
                    fileUrl: file.url,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size
                })
            },
            include: {
                sender: {
                    select: { id: true, username: true, profilePicture: true }
                },
                receiver: {
                    select: { id: true, username: true, profilePicture: true }
                }
            }
        });

        // Emit real-time message via socket
        const io = getSocketInstance();
        if (io) {
            // Emit to conversation room
            io.to(conversation.id).emit('receiveMessage', newMessage);
            
            // Emit to specific users
            io.to(`user_${receiverId}`).emit('newMessage', newMessage);
            io.to(`user_${senderId}`).emit('messageSent', newMessage);
        }

        // Update conversation's last activity
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { updatedAt: new Date() }
        });

        return res.status(200).json({
            success: true,
            message: 'Message sent successfully',
            data: newMessage
        });

    } catch (error) {
        console.error('❌ Send message error:', {
            error: error.message,
            stack: error.stack,
            senderId: req.id,
            receiverId: req.params.id,
            requestBody: req.body,
            timestamp: new Date().toISOString()
        });
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Send message to an existing conversation (group or direct) by conversationId
export const sendMessageToConversation = async (req, res) => {
    try {
        const senderId = req.id;
        const { conversationId } = req.params;
        const { message, file } = req.body;

        // Ensure user is a participant of the conversation
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: true }
        });

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        const isParticipant = conversation.participants.some(p => p.userId === senderId);
        if (!isParticipant) {
            return res.status(403).json({ success: false, message: 'Not a participant of this conversation' });
        }

        console.log('💬 Creating message with data:', {
            content: message || null,
            senderId,
            conversationId,
            messageType: file ? 'file' : 'text',
            file: file
        });

        const newMessage = await prisma.message.create({
            data: {
                content: message || null,
                senderId,
                receiverId: null,
                conversationId,
                messageType: file ? 'file' : 'text',
                ...(file && {
                    fileUrl: file.url,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size
                })
            },
            include: {
                sender: { select: { id: true, username: true, profilePicture: true } }
            }
        });

        console.log('✅ Message created:', newMessage);

        // Emit real-time to conversation room
        const io = getSocketInstance();
        if (io) {
            io.to(conversationId).emit('receiveMessage', newMessage);
        }

        await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });

        return res.status(200).json({ success: true, data: newMessage });
    } catch (error) {
        console.log('Send to conversation error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get messages for a conversation
export const getMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        
        // Find conversation between these two users
        const conversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    {
                        participants: {
                            some: { userId: senderId }
                        }
                    },
                    {
                        participants: {
                            some: { userId: receiverId }
                        }
                    },
                    { isGroup: false }
                ]
            },
            include: {
                messages: {
                    include: {
                        sender: {
                            select: { id: true, username: true, profilePicture: true }
                        },
                        receiver: {
                            select: { id: true, username: true, profilePicture: true }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });

        if (!conversation) {
            return res.status(200).json({
                success: true,
                messages: []
            });
        }

        return res.status(200).json({
            success: true,
            messages: conversation.messages
        });
    } catch (error) {
        console.log('Get messages error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get messages by conversationId
export const getMessagesByConversation = async (req, res) => {
    try {
        const userId = req.id;
        const { conversationId } = req.params;

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: true,
                messages: {
                    include: {
                        sender: { select: { id: true, username: true, profilePicture: true } },
                        receiver: { select: { id: true, username: true, profilePicture: true } },
                        reads: true,
                        reactions: {
                            include: {
                                user: { select: { id: true, username: true } }
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        const isParticipant = conversation.participants.some(p => p.userId === userId);
        if (!isParticipant) {
            return res.status(403).json({ success: false, message: 'Not a participant of this conversation' });
        }

        // Process messages to include grouped reactions
        const messagesWithReactions = conversation.messages.map(message => {
            const groupedReactions = message.reactions.reduce((acc, reaction) => {
                if (!acc[reaction.emoji]) {
                    acc[reaction.emoji] = [];
                }
                acc[reaction.emoji].push(reaction.userId);
                return acc;
            }, {});

            return {
                ...message,
                reactions: groupedReactions
            };
        });

        return res.status(200).json({ success: true, messages: messagesWithReactions });
    } catch (error) {
        console.log('Get messages by conversation error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get all conversations for a user
export const getConversations = async (req, res) => {
    try {
        // Get conversations with last message and participants
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: { userId: req.id }
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
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: {
                        sender: {
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
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Transform conversations to include lastMessage properly
        const transformedConversations = conversations.map(conv => ({
            ...conv,
            lastMessage: conv.messages[0] || null,
            messages: undefined // Remove messages array to avoid confusion
        }));

        return res.status(200).json({
            success: true,
            conversations: transformedConversations
        });
    } catch (error) {
        console.log('Get conversations error:', error?.message || error);
        // Graceful fallback to prevent frontend breakage when DB is not migrated yet
        return res.status(200).json({
            success: true,
            conversations: []
        });
    }
};

// Create group conversation
export const createGroupChat = async (req, res) => {
    try {
        let { participants, groupName } = req.body;
        const adminId = req.id;

        // Normalize participants from possible shapes
        if (Array.isArray(participants)) {
            participants = participants.map(p => typeof p === 'string' ? p : p?.id || p?.userId).filter(Boolean);
        } else if (participants && typeof participants === 'object') {
            participants = Object.values(participants).map(p => typeof p === 'string' ? p : p?.id || p?.userId).filter(Boolean);
        }

        if (!participants || participants.length < 1) {
            return res.status(400).json({
                success: false,
                message: 'Group must have at least 1 participant besides you'
            });
        }

        const conversation = await prisma.conversation.create({
            data: {
                isGroup: true,
                name: groupName,
                participants: {
                    create: [ { userId: adminId }, ...participants.map(userId => ({ userId })) ]
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, username: true, profilePicture: true }
                        }
                    }
                }
            }
        });

        return res.status(201).json({
            success: true,
            conversation
        });
    } catch (error) {
        console.log('Create group chat error:', error?.message || error);
        return res.status(400).json({
            success: false,
            message: error?.message || 'Invalid group creation payload'
        });
    }
};

// Delete message
export const deleteMessage = async (req, res) => {
    try {
        const messageId = req.params.messageId;
        const userId = req.id;

        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });
        
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        if (message.senderId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to delete this message'
            });
        }

        await prisma.message.delete({
            where: { id: messageId }
        });

        // Emit socket event
        const io = getSocketInstance();
        if (io) {
            io.to(message.conversationId).emit('messageDeleted', { messageId });
        }

        return res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.log('Delete message error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Mark a message as read
export const markMessageRead = async (req, res) => {
    try {
        const userId = req.id;
        const { messageId } = req.params;

        const message = await prisma.message.findUnique({ where: { id: messageId } });
        if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

        // Ensure user is participant of conversation
        const convo = await prisma.conversation.findUnique({
            where: { id: message.conversationId },
            include: { participants: true }
        });
        const isParticipant = convo?.participants.some(p => p.userId === userId);
        if (!isParticipant) return res.status(403).json({ success: false, message: 'Forbidden' });

        const read = await prisma.messageRead.upsert({
            where: { messageId_userId: { messageId, userId } },
            update: { readAt: new Date() },
            create: { messageId, userId }
        });

        // Emit read receipt
        const io = getSocketInstance();
        if (io) io.to(message.conversationId).emit('messageRead', { messageId, userId, readAt: read.readAt });

        return res.status(200).json({ success: true, read });
    } catch (error) {
        console.log('Mark message read error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Handle typing indicators
export const handleTyping = async (req, res) => {
    try {
        const senderId = req.id;
        const { receiverId, conversationId, isTyping } = req.body;

        const io = getSocketInstance();
        if (io) {
            if (conversationId) {
                // Group chat typing
                io.to(conversationId).emit('typing', {
                    senderId,
                    conversationId,
                    isTyping
                });
            } else if (receiverId) {
                // Direct message typing
                io.to(`user_${receiverId}`).emit('typing', {
                    senderId,
                    receiverId,
                    isTyping
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Typing status sent'
        });
    } catch (error) {
        console.log('Handle typing error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Upload file for messages
// Add message reaction
export const addMessageReaction = async (req, res) => {
    try {
        const { messageId, emoji } = req.body;
        const userId = req.id;

        // Check if message exists
        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Check if reaction already exists
        const existingReaction = await prisma.messageReaction.findUnique({
            where: {
                messageId_userId_emoji: {
                    messageId,
                    userId,
                    emoji
                }
            }
        });

        if (existingReaction) {
            return res.status(400).json({
                success: false,
                message: 'Reaction already exists'
            });
        }

        // Create reaction
        const reaction = await prisma.messageReaction.create({
            data: {
                messageId,
                userId,
                emoji
            },
            include: {
                user: { select: { id: true, username: true } }
            }
        });

        return res.status(200).json({
            success: true,
            data: reaction
        });
    } catch (error) {
        console.log('Add reaction error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Remove message reaction
export const removeMessageReaction = async (req, res) => {
    try {
        const { messageId, emoji } = req.body;
        const userId = req.id;

        // Find and delete reaction
        const deletedReaction = await prisma.messageReaction.deleteMany({
            where: {
                messageId,
                userId,
                emoji
            }
        });

        if (deletedReaction.count === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reaction not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Reaction removed'
        });
    } catch (error) {
        console.log('Remove reaction error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get message reactions
export const getMessageReactions = async (req, res) => {
    try {
        const { messageId } = req.params;

        const reactions = await prisma.messageReaction.findMany({
            where: { messageId },
            include: {
                user: { select: { id: true, username: true } }
            }
        });

        // Group reactions by emoji
        const groupedReactions = reactions.reduce((acc, reaction) => {
            if (!acc[reaction.emoji]) {
                acc[reaction.emoji] = [];
            }
            acc[reaction.emoji].push(reaction.userId);
            return acc;
        }, {});

        return res.status(200).json({
            success: true,
            data: groupedReactions
        });
    } catch (error) {
        console.log('Get reactions error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const uploadMessageFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        
        const fileData = {
            url: fileUrl,
            name: req.file.originalname,
            type: req.file.mimetype,
            size: req.file.size
        };

        console.log('📁 Message file uploaded:', {
            filename: req.file.filename,
            originalname: req.file.originalname,
            path: req.file.path,
            url: fileUrl
        });

        return res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            file: fileData
        });
    } catch (error) {
        console.log('Upload file error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// AI Chat Assistant
export const aiChatAssistant = async (req, res) => {
    try {
        const userId = req.id;
        const { message, conversationId } = req.body;

        // Get user context
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true, bio: true }
        });

        // Get conversation history if provided
        let conversationHistory = [];
        if (conversationId) {
            const messages = await prisma.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: { content: true, senderId: true }
            });
            
            conversationHistory = messages.reverse().map(msg => ({
                content: msg.content,
                isAI: false // We'll enhance this later to detect AI messages
            }));
        }

        // Ensure AI conversation exists
        let aiConversationId = conversationId;
        if (!aiConversationId) {
            const existing = await prisma.conversation.findFirst({
                where: { isAI: true, participants: { some: { userId } } },
                select: { id: true }
            });
            if (existing) {
                aiConversationId = existing.id;
            } else {
                const created = await prisma.conversation.create({
                    data: {
                        isGroup: false,
                        isAI: true,
                        name: 'AI Assistant',
                        participants: { create: [{ userId }] }
                    },
                    select: { id: true }
                });
                aiConversationId = created.id;
            }
        }

        // Persist user's message
        const userMsg = await prisma.message.create({
            data: { content: message, senderId: userId, receiverId: null, conversationId: aiConversationId, messageType: 'text' }
        });

        // Generate AI response
        const aiResponse = await aiChatService.generateResponse(message, conversationHistory, { username: user.username, bio: user.bio });
        const aiText = aiResponse.success ? aiResponse.response : aiResponse.fallbackResponse;

        // Persist AI message
        const aiMsg = await prisma.message.create({
            data: { content: aiText, senderId: userId, receiverId: null, conversationId: aiConversationId, messageType: 'text', isAI: true }
        });

        // Emit both messages
        const io = getSocketInstance();
        if (io) {
            io.to(aiConversationId).emit('receiveMessage', userMsg);
            io.to(aiConversationId).emit('receiveMessage', aiMsg);
        }

        return res.status(200).json({ success: true, response: aiText, usage: aiResponse.usage || null, conversationId: aiConversationId });
    } catch (error) {
        console.log('AI Chat Assistant error:', error?.message || error);
        // Always return a friendly fallback to keep UI working
        return res.status(200).json({ success: true, response: "I'm here to help! Could you tell me more?", usage: null });
    }
};

// Ensure an AI conversation exists and return it
export const ensureAIConversation = async (req, res) => {
    try {
        const userId = req.id;
        let conversation = await prisma.conversation.findFirst({
            where: { isAI: true, participants: { some: { userId } } },
            include: { participants: { include: { user: { select: { id: true, username: true, profilePicture: true } } } } }
        });
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: { isGroup: false, isAI: true, name: 'AI Assistant', participants: { create: [{ userId }] } },
                include: { participants: { include: { user: { select: { id: true, username: true, profilePicture: true } } } } }
            });
        }
        return res.status(200).json({ success: true, conversation });
    } catch (error) {
        console.log('Ensure AI conversation error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Smart Reply Suggestions
export const getSmartReplies = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true }
        });

        const suggestions = await aiChatService.generateSmartReply(message, {
            username: user.username
        });

        return res.status(200).json({
            success: true,
            suggestions: suggestions.suggestions
        });
    } catch (error) {
        console.log('Smart replies error:', error);
        return res.status(500).json({
            success: false,
            suggestions: ['Thanks! 😊', 'Got it 👍', 'Tell me more']
        });
    }
};

// Message Improvement
export const improveMessage = async (req, res) => {
    try {
        const { message, tone = 'friendly' } = req.body;

        const improved = await aiChatService.improveMessage(message, tone);

        return res.status(200).json({
            success: true,
            originalMessage: message,
            improvedMessage: improved.success ? improved.improvedMessage : message
        });
    } catch (error) {
        console.log('Message improvement error:', error);
        return res.status(500).json({
            success: false,
            originalMessage: req.body.message
        });
    }
};

// Message Translation
export const translateMessage = async (req, res) => {
    try {
        const { message, targetLanguage = 'en' } = req.body;

        const translation = await aiChatService.translateMessage(message, targetLanguage);

        return res.status(200).json({
            success: true,
            originalMessage: message,
            translation: translation.success ? translation.translation : message,
            targetLanguage
        });
    } catch (error) {
        console.log('Message translation error:', error);
        return res.status(500).json({
            success: false,
            originalMessage: req.body.message
        });
    }
};

// Conversation Starter
export const getConversationStarter = async (req, res) => {
    try {
        const userId = req.id;
        const { targetUserId } = req.params;

        // Get both user profiles
        const [user, targetUser] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { username: true, bio: true }
            }),
            prisma.user.findUnique({
                where: { id: targetUserId },
                select: { username: true, bio: true }
            })
        ]);

        const starter = await aiChatService.generateConversationStarter({
            currentUser: user.username,
            targetUser: targetUser.username,
            targetUserBio: targetUser.bio
        });

        return res.status(200).json({
            success: true,
            starter: starter.starter
        });
    } catch (error) {
        console.log('Conversation starter error:', error);
        return res.status(500).json({
            success: false,
            starter: "Hey! How's your day going? 😊"
        });
    }
};

// Message Moderation
export const moderateMessage = async (req, res) => {
    try {
        const { message } = req.body;

        const moderation = await aiChatService.moderateMessage(message);

        return res.status(200).json({
            success: true,
            isSafe: moderation.isSafe,
            reason: moderation.reason,
            message: moderation.isSafe ? 'Message is appropriate' : 'Message flagged for review'
        });
    } catch (error) {
        console.log('Message moderation error:', error);
        return res.status(500).json({
            success: true, // Default to safe
            isSafe: true,
            message: 'Moderation service unavailable'
        });
    }
};

// Group Management Functions
export const addGroupMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;
        const adminId = req.id;

        // Check if group exists and user is admin
        const group = await prisma.conversation.findUnique({
            where: { id: groupId, isGroup: true },
            include: { participants: true }
        });

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        const isAdmin = group.participants.some(p => p.userId === adminId);
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Add member
        await prisma.conversationParticipant.create({
            data: { conversationId: groupId, userId }
        });

        return res.status(200).json({ success: true, message: 'Member added successfully' });
    } catch (error) {
        console.log('Add group member error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const removeGroupMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;
        const adminId = req.id;

        // Check if group exists and user is admin
        const group = await prisma.conversation.findUnique({
            where: { id: groupId, isGroup: true },
            include: { participants: true }
        });

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        const isAdmin = group.participants.some(p => p.userId === adminId);
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Remove member
        await prisma.conversationParticipant.deleteMany({
            where: { conversationId: groupId, userId }
        });

        return res.status(200).json({ success: true, message: 'Member removed successfully' });
    } catch (error) {
        console.log('Remove group member error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.id;

        await prisma.conversationParticipant.deleteMany({
            where: { conversationId: groupId, userId }
        });

        return res.status(200).json({ success: true, message: 'Left group successfully' });
    } catch (error) {
        console.log('Leave group error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const adminId = req.id;

        // Check if user is admin
        const group = await prisma.conversation.findUnique({
            where: { id: groupId, isGroup: true },
            include: { participants: true }
        });

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        const isAdmin = group.participants.some(p => p.userId === adminId);
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Delete group and all related data
        await prisma.conversation.delete({ where: { id: groupId } });

        return res.status(200).json({ success: true, message: 'Group deleted successfully' });
    } catch (error) {
        console.log('Delete group error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};