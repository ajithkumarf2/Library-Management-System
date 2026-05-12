import express from 'express';
import { adminLogin, getDashboardStats, adminLogout, registerAdmin } from '../controller/adminController.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);

// Protected routes
router.post('/register', verifyAdmin, registerAdmin);
router.get('/dashboard', verifyAdmin, getDashboardStats);
router.get('/logout', adminLogout);

export default router;
