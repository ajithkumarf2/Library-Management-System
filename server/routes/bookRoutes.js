import express from 'express';
import { addBook, getAllBooks, getBookById, updateBook, deleteBook, searchBooks } from '../controller/bookController.js';
import { verifyAdmin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Public routes
router.get('/', getAllBooks);
router.get('/all', getAllBooks);
router.get('/search', searchBooks);
router.get('/:id', getBookById);

// Admin routes
router.post('/add', verifyAdmin, upload.single('document'), addBook);
router.put('/update/:id', verifyAdmin, upload.single('document'), updateBook);
router.delete('/delete/:id', verifyAdmin, deleteBook);

export default router;
