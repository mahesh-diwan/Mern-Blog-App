import express from "express";
import { test, updateUser, deleteUser } from "../controllers/user.controller.mjs";
import { verifyToken } from "../utils/verifyUser.mjs";

const router = express.Router();

router.get('/test', test)
router.put('/update/:userId', verifyToken, updateUser);
router.delete('/delete/:userId', verifyToken, deleteUser);

export default router;