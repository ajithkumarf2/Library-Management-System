import express from 'express';
import { issueBook, returnBook, getIssueHistory, getIssuedBooks, getReturnedBooks, getOverdueBooks, getMemberIssues } from '../controller/issueController.js';
import { verifyAdmin, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Member routes
router.get('/member/:memberId', verifyToken, getMemberIssues);

// Admin routes
router.post('/issue', verifyAdmin, issueBook);
router.put('/return/:issueId', verifyAdmin, returnBook);
router.get('/history', verifyAdmin, getIssueHistory);
router.get('/issued', verifyAdmin, getIssuedBooks);
router.get('/returned', verifyAdmin, getReturnedBooks);
router.get('/overdue', verifyAdmin, getOverdueBooks);

export default router;
