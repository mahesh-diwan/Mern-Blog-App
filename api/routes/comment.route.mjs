import express from 'express';
import {verifyToken} from '../utils/verifyUser.mjs'
import { createComment, getPostComments, likeComment } from '../controllers/comment.controller.mjs';

const router = express.Router();

router.post('/create', verifyToken, createComment)
router.get('/get-post-comments/:postId', verifyToken, getPostComments);
router.put('/like-comment/:commentId', verifyToken, likeComment);

export default router;