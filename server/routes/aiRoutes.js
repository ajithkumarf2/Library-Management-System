import express from 'express';
import { getBookRecommendations } from '../controller/aiController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/recommend', verifyToken, getBookRecommendations);

export default router;
