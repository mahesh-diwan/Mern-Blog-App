import express from 'express';
import { verifyToken } from '../utils/verifyUser.mjs';
import { createBlog, getPosts } from '../controllers/post.controller.mjs';

const router = express.Router();

router.post('/create-post', verifyToken, createBlog);
router.get('/get-post', getPosts);

export default router;