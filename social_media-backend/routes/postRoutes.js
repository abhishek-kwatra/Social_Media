import express from 'express';
import { createPost, getFeed } from '../controller/postController.js';
import { updateProfile } from '../controller/profileController.js';
import {verifyAccessToken}  from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/createPost', verifyAccessToken, createPost);
router.get('/getFeed', getFeed);
router.put('/update-bio', verifyAccessToken, updateProfile);

export default router;
