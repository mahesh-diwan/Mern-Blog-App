import express from 'express';
import {verifyToken} from '../utils/verifyUser.mjs'
import { createComment } from '../controllers/comment.controller.mjs';

const router = express.Router();

router.post('/create', verifyToken, createComment)

export default router;