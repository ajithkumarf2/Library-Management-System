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

// Self Issue Book (for reading)
export const selfIssueBook = async (req, res) => {
    try {
        const { bookId } = req.body;
        const memberId = req.user.id; // From verifyToken middleware
        
        // Default due date: 14 days from now
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);
        const dueDateStr = dueDate.toISOString().split('T')[0];

        if (!bookId) {
            return res.status(400).json({ message: 'Book ID is required' });
        }

        // Check if book exists
        const [books] = await db.query('SELECT * FROM books WHERE id = ?', [bookId]);
        if (books.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Check if book is already issued to this member
        const [existing] = await db.query(
            'SELECT * FROM issueHistory WHERE memberId = ? AND bookId = ? AND status = "issued"',
            [memberId, bookId]
        );
        
        if (existing.length > 0) {
            return res.status(200).json({ message: 'Book already issued', issueId: existing[0].id });
        }

        // Check availability
        if (books[0].availableQuantity <= 0) {
            return res.status(400).json({ message: 'Book is not available for issue' });
        }

        // Issue book
        const [result] = await db.query(
            'INSERT INTO issueHistory (memberId, bookId, dueDate) VALUES (?, ?, ?)',
            [memberId, bookId, dueDateStr]
        );

        // Update available quantity
        await db.query('UPDATE books SET availableQuantity = availableQuantity - 1 WHERE id = ?', [bookId]);

        res.status(201).json({ message: 'Book issued for reading', issueId: result.insertId });
    } catch (error) {
        console.error('Self issue error:', error);
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

// Self Return Book
export const selfReturnBook = async (req, res) => {
    try {
        const { issueId } = req.params;
        const memberId = req.user.id;

        // Check if issue exists and belongs to this member
        const [issues] = await db.query(
            'SELECT * FROM issueHistory WHERE id = ? AND memberId = ? AND status = "issued"',
            [issueId, memberId]
        );

        if (issues.length === 0) {
            return res.status(404).json({ message: 'Active issue not found for this user' });
        }

        const bookId = issues[0].bookId;
        const returnDate = new Date().toISOString().split('T')[0];

        // Update issue status
        await db.query(
            'UPDATE issueHistory SET status = "returned", returnDate = ? WHERE id = ?',
            [returnDate, issueId]
        );

        // Update available quantity
        await db.query('UPDATE books SET availableQuantity = availableQuantity + 1 WHERE id = ?', [bookId]);

        res.status(200).json({ message: 'Book returned successfully' });
    } catch (error) {
        console.error('Self return error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Issue History
export const getIssueHistory = async (req, res) => {
    try {
        const { memberId } = req.query;

        let query = `
            SELECT ih.*, b.title AS bookTitle, b.author, b.isbn, b.document, m.name AS memberName, m.email
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
            SELECT ih.*, b.title AS bookTitle, b.author, b.isbn, b.document, m.name AS memberName, m.email
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
            SELECT ih.*, b.title AS bookTitle, b.author, b.isbn, b.document, m.name AS memberName, m.email
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
            SELECT ih.*, b.title AS bookTitle, b.author, b.isbn, b.document, m.name AS memberName, m.email
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
            SELECT ih.*, b.title AS bookTitle, b.author, b.isbn, b.document
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

// Get Member Analytics
export const getMemberAnalytics = async (req, res) => {
    try {
        const memberId = req.user.id;

        // 1. Basic Stats
        const [totalBooks] = await db.query(
            'SELECT COUNT(*) as count FROM issueHistory WHERE memberId = ?',
            [memberId]
        );

        const [returnedBooks] = await db.query(
            'SELECT COUNT(*) as count FROM issueHistory WHERE memberId = ? AND status = "returned"',
            [memberId]
        );

        // 2. Genre Distribution
        const [genres] = await db.query(
            'SELECT b.category as name, COUNT(*) as count FROM issueHistory ih JOIN books b ON ih.bookId = b.id WHERE ih.memberId = ? GROUP BY b.category',
            [memberId]
        );

        // Calculate percentages for genres
        const totalCount = totalBooks[0].count || 1;
        const formattedGenres = genres.map(g => ({
            name: g.name || 'General',
            percentage: Math.round((g.count / totalCount) * 100),
            color: 'bg-blue-500' // Default color, can be randomized later
        }));

        // 3. Monthly Activity (last 6 months)
        const [activity] = await db.query(
            `SELECT DATE_FORMAT(issueDate, '%b') as month, COUNT(*) as count 
             FROM issueHistory 
             WHERE memberId = ? AND issueDate >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY month, MONTH(issueDate)
             ORDER BY MONTH(issueDate) ASC`,
            [memberId]
        );

        res.json({
            stats: [
                { label: 'Books Read', value: (totalBooks[0].count || 0).toString(), color: 'bg-blue-500', icon: 'FiBook' },
                { label: 'Books Returned', value: (returnedBooks[0].count || 0).toString(), color: 'bg-emerald-500', icon: 'FiCheckCircle' },
                { label: 'Reading Sessions', value: (totalBooks[0].count || 0).toString(), color: 'bg-orange-500', icon: 'FiClock' },
                { label: 'Achievements', value: Math.floor((totalBooks[0].count || 0) / 5).toString(), color: 'bg-purple-500', icon: 'FiAward' },
            ],
            genres: formattedGenres,
            activity: activity
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
