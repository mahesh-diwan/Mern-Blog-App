import express from 'express';
import {verifyToken} from '../utils/verifyUser.mjs'
import { createComment, getPostComments } from '../controllers/comment.controller.mjs';

const router = express.Router();

router.post('/create', verifyToken, createComment)
router.get('/get-post-comments/:postId', verifyToken, getPostComments);

export default router;