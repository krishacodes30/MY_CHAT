import express from 'express';
import { getMessages } from '../controllers/message.controller.js';
import authUser from '../middleware/auth.middleware.js';

const router = express.Router();

router.get(
    '/:projectId',
    authUser,
    getMessages
);

export default router;