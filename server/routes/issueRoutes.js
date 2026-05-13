import express from 'express';
import { issueBook, returnBook, getIssueHistory, getIssuedBooks, getReturnedBooks, getOverdueBooks, getMemberIssues, selfIssueBook, selfReturnBook, getMemberAnalytics } from '../controller/issueController.js';
import { verifyAdmin, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Member routes
router.get('/member/:memberId', verifyToken, getMemberIssues);
router.post('/self-issue', verifyToken, selfIssueBook);
router.put('/self-return/:issueId', verifyToken, selfReturnBook);
router.get('/analytics', verifyToken, getMemberAnalytics);

// Admin routes
router.post('/issue', verifyAdmin, issueBook);
router.put('/return/:issueId', verifyAdmin, returnBook);
router.get('/history', verifyAdmin, getIssueHistory);
router.get('/issued', verifyAdmin, getIssuedBooks);
router.get('/returned', verifyAdmin, getReturnedBooks);
router.get('/overdue', verifyAdmin, getOverdueBooks);

export default router;
