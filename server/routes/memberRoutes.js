import express from 'express';
import { registerMember, loginMember, getMemberProfile, updateMemberProfile, getAllMembers, logoutMember, deleteMember, getMemberById, updateMember, deleteMemberAdmin } from '../controller/memberController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerMember);
router.post('/login', loginMember);

// Protected routes (Member)
router.get('/profile', verifyToken, getMemberProfile);
router.put('/profile', verifyToken, updateMemberProfile);
router.delete('/profile', verifyToken, deleteMember);
router.get('/logout', logoutMember);

// Admin routes
router.get('/all', verifyAdmin, getAllMembers);
router.get('/:id', verifyAdmin, getMemberById);
router.put('/:id', verifyAdmin, updateMember);
router.delete('/:id', verifyAdmin, deleteMemberAdmin);

export default router;
