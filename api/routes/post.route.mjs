import express from 'express';
import { verifyToken } from '../utils/verifyUser.mjs';
import { createBlog, getPosts, deletePost } from '../controllers/post.controller.mjs';

const router = express.Router();

router.post('/create-post', verifyToken, createBlog);
router.get('/get-post', getPosts);
router.delete('/delete-post/:postId/:userId', verifyToken, deletePost);

export default router;