import express from 'express';
import { addBook, getAllBooks, getBookById, updateBook, deleteBook, searchBooks } from '../controller/bookController.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllBooks);
router.get('/all', getAllBooks);
router.get('/search', searchBooks);
router.get('/:id', getBookById);

// Admin routes
router.post('/add', verifyAdmin, addBook);
router.put('/update/:id', verifyAdmin, updateBook);
router.delete('/delete/:id', verifyAdmin, deleteBook);

export default router;
