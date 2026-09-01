import express from 'express';
import { uploadProjectDocument } from '../controllers/ai.controller.js';
import authUser from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.middleware.js';

const router = express.Router();

router.post(
    '/projects/:projectId/documents',
    authUser,
    upload.single('file'),
    uploadProjectDocument
);

export default router;