import express from 'express';
import { likePost, getLikes } from '../controller/likeController.js';
import {verifyAccessToken}  from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/:id/like', verifyAccessToken, likePost);
// router.post('/:id/like', likePost);
router.get('/:id/likes', getLikes);

export default router;