import express from 'express';
import { addToWishlist, getWishlist, removeFromWishlist } from '../controller/wishlistController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/add', verifyToken, addToWishlist);
router.get('/', verifyToken, getWishlist);
router.delete('/:id', verifyToken, removeFromWishlist);

export default router;
