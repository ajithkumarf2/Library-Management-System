import db from '../config/db.js';
import crypto from 'crypto';

// Add Book (Product)
export const addBook = async (req, res) => {
    try {
        const { title, author, isbn, category, quantity, description, shelfLocation } = req.body;
        const document = req.file ? req.file.path : null;

        if (!title || !author || !quantity) {
            return res.status(400).json({ message: 'Title, author, and quantity are required' });
        }

        // Generate 16-digit hexadecimal key
        const hexKey = crypto.randomBytes(8).toString('hex');

        // Insert into Product
        const [result] = await db.query(
            'INSERT INTO Product (Product_name, Product_short_desc, Product_long_desc, PK_Product_KEY, isbn, category, shelfLocation, document) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, author, description, hexKey, isbn, category, shelfLocation, document]
        );

        const productId = result.insertId;

        // Insert into Product_Stock
        await db.query(
            'INSERT INTO Product_Stock (Product_ID, QTY, Available) VALUES (?, ?, ?)',
            [productId, quantity, quantity]
        );

        // Insert log in Inwards
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0];
        await db.query(
            'INSERT INTO Inwards (I_Date, I_Time, FK_Product_KEY, I_Qty, I_Price) VALUES (?, ?, ?, ?, ?)',
            [dateStr, timeStr, hexKey, quantity, 0.00]
        );

        res.status(201).json({ message: 'Product added successfully', bookId: productId, productKey: hexKey });
    } catch (error) {
        console.error('Add book error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get All Books (Products)
export const getAllBooks = async (req, res) => {
    try {
        const [books] = await db.query(
            `SELECT p.PK_Product_id as id, p.Product_name as title, p.Product_short_desc as author, p.Product_long_desc as description, p.PK_Product_KEY, p.isbn, p.category, p.shelfLocation, p.document, p.status, p.createdAt, p.updatedAt, ps.QTY as quantity, ps.Available as availableQuantity
             FROM Product p
             LEFT JOIN Product_Stock ps ON p.PK_Product_id = ps.Product_ID`
        );
        res.json(books);
    } catch (error) {
        console.error('Get all books error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Book (Product) by ID
export const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const [books] = await db.query(
            `SELECT p.PK_Product_id as id, p.Product_name as title, p.Product_short_desc as author, p.Product_long_desc as description, p.PK_Product_KEY, p.isbn, p.category, p.shelfLocation, p.document, p.status, p.createdAt, p.updatedAt, ps.QTY as quantity, ps.Available as availableQuantity
             FROM Product p
             LEFT JOIN Product_Stock ps ON p.PK_Product_id = ps.Product_ID
             WHERE p.PK_Product_id = ?`,
            [id]
        );

        if (books.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(books[0]);
    } catch (error) {
        console.error('Get book by ID error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Book (Product)
export const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, isbn, category, quantity, description, shelfLocation } = req.body;
        let document = req.body.document; // Keep existing if not updated

        if (req.file) {
            document = req.file.path;
        }

        // Fetch current stock to handle difference and inwards/outwards logging
        const [currentStock] = await db.query(
            `SELECT ps.QTY, p.PK_Product_KEY
             FROM Product p
             LEFT JOIN Product_Stock ps ON p.PK_Product_id = ps.Product_ID
             WHERE p.PK_Product_id = ?`,
            [id]
        );

        if (currentStock.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const oldQty = currentStock[0].QTY || 0;
        const hexKey = currentStock[0].PK_Product_KEY;
        const newQty = parseInt(quantity, 10) || 0;
        const diff = newQty - oldQty;

        // Update Product table
        await db.query(
            'UPDATE Product SET Product_name = ?, Product_short_desc = ?, Product_long_desc = ?, isbn = ?, category = ?, shelfLocation = ?, document = ? WHERE PK_Product_id = ?',
            [title, author, description, isbn, category, shelfLocation, document, id]
        );

        // Update Product_Stock table
        await db.query(
            'UPDATE Product_Stock SET QTY = ?, Available = Available + ? WHERE Product_ID = ?',
            [newQty, diff, id]
        );

        // Inwards / Outwards Logging
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0];

        if (diff > 0) {
            await db.query(
                'INSERT INTO Inwards (I_Date, I_Time, FK_Product_KEY, I_Qty, I_Price) VALUES (?, ?, ?, ?, ?)',
                [dateStr, timeStr, hexKey, diff, 0.00]
            );
        } else if (diff < 0) {
            await db.query(
                'INSERT INTO Outwards (O_Date, O_Time, FK_Product_KEY, O_Qty, O_Price) VALUES (?, ?, ?, ?, ?)',
                [dateStr, timeStr, hexKey, Math.abs(diff), 0.00]
            );
        }

        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete Book (Product)
export const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM Product WHERE PK_Product_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Search Books (Products)
export const searchBooks = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const searchQuery = `%${query}%`;
        const [books] = await db.query(
            `SELECT p.PK_Product_id as id, p.Product_name as title, p.Product_short_desc as author, p.Product_long_desc as description, p.PK_Product_KEY, p.isbn, p.category, p.shelfLocation, p.document, p.status, p.createdAt, p.updatedAt, ps.QTY as quantity, ps.Available as availableQuantity
             FROM Product p
             LEFT JOIN Product_Stock ps ON p.PK_Product_id = ps.Product_ID
             WHERE p.Product_name LIKE ? OR p.Product_short_desc LIKE ? OR p.isbn LIKE ? OR p.category LIKE ?`,
            [searchQuery, searchQuery, searchQuery, searchQuery]
        );

        res.json(books);
    } catch (error) {
        console.error('Search books error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
