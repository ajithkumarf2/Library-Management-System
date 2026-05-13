import db from '../config/db.js';

// Add Book
export const addBook = async (req, res) => {
    try {
        const { title, author, isbn, category, quantity, description, shelfLocation } = req.body;
        const document = req.file ? req.file.path : null;

        if (!title || !author || !quantity) {
            return res.status(400).json({ message: 'Title, author, and quantity are required' });
        }

        const [result] = await db.query(
            'INSERT INTO books (title, author, isbn, category, quantity, availableQuantity, description, shelfLocation, document) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, author, isbn, category, quantity, quantity, description, shelfLocation, document]
        );

        res.status(201).json({ message: 'Book added successfully', bookId: result.insertId });
    } catch (error) {
        console.error('Add book error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get All Books
export const getAllBooks = async (req, res) => {
    try {
        const [books] = await db.query('SELECT * FROM books');
        res.json(books);
    } catch (error) {
        console.error('Get all books error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Book by ID
export const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const [books] = await db.query('SELECT * FROM books WHERE id = ?', [id]);

        if (books.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json(books[0]);
    } catch (error) {
        console.error('Get book by ID error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Book
export const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, isbn, category, quantity, description, shelfLocation } = req.body;
        let document = req.body.document; // Keep existing if not updated

        if (req.file) {
            document = req.file.path;
        }

        const [result] = await db.query(
            'UPDATE books SET title = ?, author = ?, isbn = ?, category = ?, quantity = ?, description = ?, shelfLocation = ?, document = ? WHERE id = ?',
            [title, author, isbn, category, quantity, description, shelfLocation, document, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json({ message: 'Book updated successfully' });
    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete Book
export const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM books WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Search Books
export const searchBooks = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const searchQuery = `%${query}%`;
        const [books] = await db.query(
            'SELECT * FROM books WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ? OR category LIKE ?',
            [searchQuery, searchQuery, searchQuery, searchQuery]
        );

        res.json(books);
    } catch (error) {
        console.error('Search books error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
