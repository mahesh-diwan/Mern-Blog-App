import express from 'express';
import { verifyToken } from '../utils/verifyUser.mjs';
import { createBlog } from '../controllers/post.controller.mjs';

const router = express.Router();

router.post('/create-post', verifyToken, createBlog)

export default router;