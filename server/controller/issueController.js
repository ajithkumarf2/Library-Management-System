import db from '../config/db.js';

const FINE_PER_DAY = 10; // Fine per day in currency

// Issue Book
export const issueBook = async (req, res) => {
    try {
        const { memberId, bookId, dueDate } = req.body;

        if (!memberId || !bookId || !dueDate) {
            return res.status(400).json({ message: 'Member ID, Book ID, and due date are required' });
        }

        // Check if member exists
        const [members] = await db.query('SELECT * FROM members WHERE id = ?', [memberId]);
        if (members.length === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Check if book exists and is available
        const [books] = await db.query('SELECT * FROM books WHERE id = ?', [bookId]);
        if (books.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (books[0].availableQuantity <= 0) {
            return res.status(400).json({ message: 'Book is not available' });
        }

        // Check if book is already issued to this member
        const [issuedBooks] = await db.query(
            'SELECT * FROM issueHistory WHERE memberId = ? AND bookId = ? AND status = "issued"',
            [memberId, bookId]
        );
        if (issuedBooks.length > 0) {
            return res.status(400).json({ message: 'Member has already issued this book' });
        }

        // Issue book
        const [result] = await db.query(
            'INSERT INTO issueHistory (memberId, bookId, dueDate) VALUES (?, ?, ?)',
            [memberId, bookId, dueDate]
        );

        // Update available quantity
        await db.query('UPDATE books SET availableQuantity = availableQuantity - 1 WHERE id = ?', [bookId]);

        res.status(201).json({ message: 'Book issued successfully', issueId: result.insertId });
    } catch (error) {
        console.error('Issue book error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Return Book
export const returnBook = async (req, res) => {
    try {
        const { issueId } = req.params;
        const returnDate = new Date().toISOString().split('T')[0];

        // Get issue record
        const [issues] = await db.query('SELECT * FROM issueHistory WHERE id = ?', [issueId]);
        if (issues.length === 0) {
            return res.status(404).json({ message: 'Issue record not found' });
        }

        const issue = issues[0];
        if (issue.status !== 'issued') {
            return res.status(400).json({ message: 'Book is not currently issued' });
        }

        // Calculate fine if overdue
        const dueDate = new Date(issue.dueDate);
        const currentDate = new Date(returnDate);
        let fine = 0;

        if (currentDate > dueDate) {
            const daysOverdue = Math.floor((currentDate - dueDate) / (1000 * 60 * 60 * 24));
            fine = daysOverdue * FINE_PER_DAY;
        }

        // Update issue record
        await db.query(
            'UPDATE issueHistory SET returnDate = ?, status = ?, fine = ? WHERE id = ?',
            [returnDate, 'returned', fine, issueId]
        );

        // Update available quantity
        await db.query('UPDATE books SET availableQuantity = availableQuantity + 1 WHERE id = ?', [issue.bookId]);

        res.json({ message: 'Book returned successfully', fine, issueId });
    } catch (error) {
        console.error('Return book error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Issue History
export const getIssueHistory = async (req, res) => {
    try {
        const { memberId } = req.query;

        let query = `
            SELECT ih.*, b.title AS bookTitle, b.author, b.isbn, m.name AS memberName, m.email
            FROM issueHistory ih
            JOIN books b ON ih.bookId = b.id
            JOIN members m ON ih.memberId = m.id
        `;

        if (memberId) {
            query += ` WHERE ih.memberId = ${memberId}`;
        }

        query += ' ORDER BY ih.issueDate DESC';

        const [issues] = await db.query(query);
        res.json(issues);
    } catch (error) {
        console.error('Get issue history error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Issued Books
export const getIssuedBooks = async (req, res) => {
    try {
        const [issuedBooks] = await db.query(`
            SELECT ih.*, b.title AS bookTitle, b.author, b.isbn, m.name AS memberName, m.email
            FROM issueHistory ih
            JOIN books b ON ih.bookId = b.id
            JOIN members m ON ih.memberId = m.id
            WHERE ih.status = 'issued'
            ORDER BY ih.issueDate DESC
        `);

        res.json(issuedBooks);
    } catch (error) {
        console.error('Get issued books error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Returned Books
export const getReturnedBooks = async (req, res) => {
    try {
        const [returnedBooks] = await db.query(`
            SELECT ih.*, b.title AS bookTitle, b.author, b.isbn, m.name AS memberName, m.email
            FROM issueHistory ih
            JOIN books b ON ih.bookId = b.id
            JOIN members m ON ih.memberId = m.id
            WHERE ih.status = 'returned'
            ORDER BY ih.returnDate DESC
        `);

        res.json(returnedBooks);
    } catch (error) {
        console.error('Get returned books error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Overdue Books
export const getOverdueBooks = async (req, res) => {
    try {
        const currentDate = new Date().toISOString().split('T')[0];

        const [overdueBooks] = await db.query(`
            SELECT ih.*, b.title AS bookTitle, b.author, b.isbn, m.name AS memberName, m.email
            FROM issueHistory ih
            JOIN books b ON ih.bookId = b.id
            JOIN members m ON ih.memberId = m.id
            WHERE ih.status = 'issued' AND ih.dueDate < ?
            ORDER BY ih.dueDate ASC
        `, [currentDate]);

        res.json(overdueBooks);
    } catch (error) {
        console.error('Get overdue books error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Issued Books for a specific Member
export const getMemberIssues = async (req, res) => {
    try {
        const { memberId } = req.params;

        const [issues] = await db.query(`
            SELECT ih.*, b.title AS bookTitle, b.author, b.isbn
            FROM issueHistory ih
            JOIN books b ON ih.bookId = b.id
            WHERE ih.memberId = ?
            ORDER BY ih.issueDate DESC
        `, [memberId]);

        res.json(issues);
    } catch (error) {
        console.error('Get member issues error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
