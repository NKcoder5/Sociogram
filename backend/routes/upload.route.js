import express from 'express';
import upload from '../middlewares/upload.js';
import { uploadFile } from '../controllers/upload.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

router.post('/file', isAuthenticated, upload.single('file'), uploadFile);

export default router;
