import express from "express";
import multer from "multer";
import path from "path";
import { 
  getMessage, 
  sendMessage, 
  sendMessageToConversation,
  getConversations, 
  createGroupChat, 
  deleteMessage, 
  handleTyping, 
  uploadMessageFile,
  aiChatAssistant,
  getSmartReplies,
  improveMessage,
  translateMessage,
  getConversationStarter,
  moderateMessage,
  getMessagesByConversation,
  markMessageRead,
  ensureAIConversation,
  addGroupMember,
  removeGroupMember,
  leaveGroup,
  deleteGroup,
  addMessageReaction,
  removeMessageReaction,
  getMessageReactions
} from "../controllers/message.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images, videos, documents
        const allowedExtensions = /jpeg|jpg|png|gif|mp4|mov|pdf|doc|docx|txt/;
        const allowedMimeTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
            'video/mp4', 'video/quicktime',
            'application/pdf',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        
        const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedMimeTypes.includes(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Allowed: images, videos, documents. Got: ${file.mimetype}`));
        }
    }
});

// Core messaging routes
router.post("/send/:id", isAuthenticated, sendMessage);
router.get("/all/:id", isAuthenticated, getMessage);
router.get("/conversations", isAuthenticated, getConversations);
router.get("/conversation/:conversationId", isAuthenticated, getMessagesByConversation);
router.post("/conversation/:conversationId/send", isAuthenticated, sendMessageToConversation);
router.post("/:messageId/read", isAuthenticated, markMessageRead);
router.post("/group", isAuthenticated, createGroupChat);
router.delete("/delete/:messageId", isAuthenticated, deleteMessage);
router.post("/typing", isAuthenticated, handleTyping);
router.post("/upload", isAuthenticated, upload.single('file'), uploadMessageFile);

// Group management routes
router.post("/group/:groupId/add", isAuthenticated, addGroupMember);
router.post("/group/:groupId/remove", isAuthenticated, removeGroupMember);
router.post("/group/:groupId/leave", isAuthenticated, leaveGroup);
router.delete("/group/:groupId", isAuthenticated, deleteGroup);

// Message reaction routes
router.post("/reaction/add", isAuthenticated, addMessageReaction);
router.post("/reaction/remove", isAuthenticated, removeMessageReaction);
router.get("/reaction/:messageId", isAuthenticated, getMessageReactions);

// AI-powered messaging routes
router.post("/ai/chat", isAuthenticated, aiChatAssistant);
router.get("/ai/conversation", isAuthenticated, ensureAIConversation);
router.post("/ai/smart-replies", isAuthenticated, getSmartReplies);
router.post("/ai/improve", isAuthenticated, improveMessage);
router.post("/ai/translate", isAuthenticated, translateMessage);
router.get("/ai/starter/:targetUserId", isAuthenticated, getConversationStarter);
router.post("/ai/moderate", isAuthenticated, moderateMessage);

export default router;