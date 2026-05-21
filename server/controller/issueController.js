import db from '../config/db.js';
import { FINE_RATE_PER_DAY, calculateFine, getDaysOverdue } from '../utils/constants.js';

// Helper function to compute fine for an issue record (3NF fix: compute instead of store)
const computeIssueWithFine = (issue) => {
    const fine = issue.status === 'returned' ? calculateFine(issue.returnDate, issue.dueDate) : 0;
    return { ...issue, fine };
};

// Issue Book (Product)
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

        // Check if product exists and is available
        const [books] = await db.query(
            `SELECT p.*, ps.Available as availableQuantity, p.PK_Product_KEY 
             FROM Product p 
             JOIN Product_Stock ps ON p.PK_Product_id = ps.Product_ID 
             WHERE p.PK_Product_id = ?`,
            [bookId]
        );
        if (books.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (books[0].availableQuantity <= 0) {
            return res.status(400).json({ message: 'Product is not available' });
        }

        // Check if book is already issued to this member
        const [issuedBooks] = await db.query(
            'SELECT * FROM issueHistory WHERE memberId = ? AND bookId = ? AND status = "issued"',
            [memberId, bookId]
        );
        if (issuedBooks.length > 0) {
            return res.status(400).json({ message: 'Member has already issued this product' });
        }

        // Issue book
        const [result] = await db.query(
            'INSERT INTO issueHistory (memberId, bookId, dueDate) VALUES (?, ?, ?)',
            [memberId, bookId, dueDate]
        );

        // Update available quantity
        await db.query('UPDATE Product_Stock SET Available = Available - 1 WHERE Product_ID = ?', [bookId]);

        // Log transaction in Outwards
        const hexKey = books[0].PK_Product_KEY;
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0];
        await db.query(
            'INSERT INTO Outwards (O_Date, O_Time, FK_Product_KEY, O_Qty, O_Price) VALUES (?, ?, ?, ?, ?)',
            [dateStr, timeStr, hexKey, 1, 0.00]
        );

        res.status(201).json({ message: 'Product issued successfully', issueId: result.insertId });
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
            return res.status(400).json({ message: 'Product ID is required' });
        }

        // Check if product exists
        const [books] = await db.query(
            `SELECT p.*, ps.Available as availableQuantity, p.PK_Product_KEY 
             FROM Product p 
             JOIN Product_Stock ps ON p.PK_Product_id = ps.Product_ID 
             WHERE p.PK_Product_id = ?`,
            [bookId]
        );
        if (books.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if book is already issued to this member
        const [existing] = await db.query(
            'SELECT * FROM issueHistory WHERE memberId = ? AND bookId = ? AND status = "issued"',
            [memberId, bookId]
        );
        
        if (existing.length > 0) {
            return res.status(200).json({ message: 'Product already issued', issueId: existing[0].id });
        }

        // Check availability
        if (books[0].availableQuantity <= 0) {
            return res.status(400).json({ message: 'Product is not available for issue' });
        }

        // Issue book
        const [result] = await db.query(
            'INSERT INTO issueHistory (memberId, bookId, dueDate) VALUES (?, ?, ?)',
            [memberId, bookId, dueDateStr]
        );

        // Update available quantity
        await db.query('UPDATE Product_Stock SET Available = Available - 1 WHERE Product_ID = ?', [bookId]);

        // Log transaction in Outwards
        const hexKey = books[0].PK_Product_KEY;
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0];
        await db.query(
            'INSERT INTO Outwards (O_Date, O_Time, FK_Product_KEY, O_Qty, O_Price) VALUES (?, ?, ?, ?, ?)',
            [dateStr, timeStr, hexKey, 1, 0.00]
        );

        res.status(201).json({ message: 'Product issued for reading', issueId: result.insertId });
    } catch (error) {
        console.error('Self issue error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Return Book
export const returnBook = async (req, res) => {
    try {
        const { issueId } = req.params;
        const now = new Date();
        const returnDateTime = now.toISOString().slice(0, 19).replace('T', ' '); // Format: YYYY-MM-DD HH:MM:SS
        const returnDate = now.toISOString().split('T')[0]; // For date comparison only

        // Get issue record
        const [issues] = await db.query('SELECT * FROM issueHistory WHERE id = ?', [issueId]);
        if (issues.length === 0) {
            return res.status(404).json({ message: 'Issue record not found' });
        }

        const issue = issues[0];
        if (issue.status !== 'issued') {
            return res.status(400).json({ message: 'Product is not currently issued' });
        }

        // Calculate fine (COMPUTED, not stored)
        const fine = calculateFine(returnDate, issue.dueDate);

        // Update issue record with datetime (NO fine column stored)
        await db.query(
            'UPDATE issueHistory SET returnDate = ?, status = ? WHERE id = ?',
            [returnDateTime, 'returned', issueId]
        );

        // Update available quantity
        await db.query('UPDATE Product_Stock SET Available = Available + 1 WHERE Product_ID = ?', [issue.bookId]);

        // Log transaction in Inwards
        const [products] = await db.query('SELECT PK_Product_KEY FROM Product WHERE PK_Product_id = ?', [issue.bookId]);
        if (products.length > 0) {
            const hexKey = products[0].PK_Product_KEY;
            const dateStr = now.toISOString().split('T')[0];
            const timeStr = now.toTimeString().split(' ')[0];
            await db.query(
                'INSERT INTO Inwards (I_Date, I_Time, FK_Product_KEY, I_Qty, I_Price) VALUES (?, ?, ?, ?, ?)',
                [dateStr, timeStr, hexKey, 1, fine || 0.00]
            );
        }

        res.json({ message: 'Product returned successfully', fine, issueId });
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
        const now = new Date();
        const returnDateTime = now.toISOString().slice(0, 19).replace('T', ' '); // Format: YYYY-MM-DD HH:MM:SS

        // Update issue status with datetime
        await db.query(
            'UPDATE issueHistory SET status = "returned", returnDate = ? WHERE id = ?',
            [returnDateTime, issueId]
        );

        // Update available quantity
        await db.query('UPDATE Product_Stock SET Available = Available + 1 WHERE Product_ID = ?', [bookId]);

        // Log transaction in Inwards
        const [products] = await db.query('SELECT PK_Product_KEY FROM Product WHERE PK_Product_id = ?', [bookId]);
        if (products.length > 0) {
            const hexKey = products[0].PK_Product_KEY;
            const dateStr = now.toISOString().split('T')[0];
            const timeStr = now.toTimeString().split(' ')[0];
            await db.query(
                'INSERT INTO Inwards (I_Date, I_Time, FK_Product_KEY, I_Qty, I_Price) VALUES (?, ?, ?, ?, ?)',
                [dateStr, timeStr, hexKey, 1, 0.00]
            );
        }

        res.status(200).json({ message: 'Product returned successfully' });
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
            SELECT ih.*, p.Product_name AS bookTitle, p.Product_short_desc AS author, p.isbn, p.document, m.name AS memberName, m.email
            FROM issueHistory ih
            JOIN Product p ON ih.bookId = p.PK_Product_id
            JOIN members m ON ih.memberId = m.id
        `;

        if (memberId) {
            query += ` WHERE ih.memberId = ${memberId}`;
        }

        query += ' ORDER BY ih.issueDate DESC';

        const [issues] = await db.query(query);
        
        // Compute fine for each issue (3NF fix)
        const issuesWithFine = issues.map(computeIssueWithFine);
        
        res.json(issuesWithFine);
    } catch (error) {
        console.error('Get issue history error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Issued Books
export const getIssuedBooks = async (req, res) => {
    try {
        const [issuedBooks] = await db.query(`
            SELECT ih.*, p.Product_name AS bookTitle, p.Product_short_desc AS author, p.isbn, p.document, m.name AS memberName, m.email
            FROM issueHistory ih
            JOIN Product p ON ih.bookId = p.PK_Product_id
            JOIN members m ON ih.memberId = m.id
            WHERE ih.status = 'issued'
            ORDER BY ih.issueDate DESC
        `);

        // Compute fine for each issue (3NF fix)
        const booksWithFine = issuedBooks.map(computeIssueWithFine);
        
        res.json(booksWithFine);
    } catch (error) {
        console.error('Get issued books error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Returned Books
export const getReturnedBooks = async (req, res) => {
    try {
        const [returnedBooks] = await db.query(`
            SELECT ih.*, p.Product_name AS bookTitle, p.Product_short_desc AS author, p.isbn, p.document, m.name AS memberName, m.email
            FROM issueHistory ih
            JOIN Product p ON ih.bookId = p.PK_Product_id
            JOIN members m ON ih.memberId = m.id
            WHERE ih.status = 'returned'
            ORDER BY ih.returnDate DESC
        `);

        // Compute fine for each issue (3NF fix)
        const booksWithFine = returnedBooks.map(computeIssueWithFine);
        
        res.json(booksWithFine);
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
            SELECT ih.*, p.Product_name AS bookTitle, p.Product_short_desc AS author, p.isbn, p.document, m.name AS memberName, m.email
            FROM issueHistory ih
            JOIN Product p ON ih.bookId = p.PK_Product_id
            JOIN members m ON ih.memberId = m.id
            WHERE ih.status = 'issued' AND ih.dueDate < ?
            ORDER BY ih.dueDate ASC
        `, [currentDate]);

        // Compute fine for each issue (3NF fix)
        const booksWithFine = overdueBooks.map(computeIssueWithFine);
        
        res.json(booksWithFine);
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
            SELECT ih.*, p.Product_name AS bookTitle, p.Product_short_desc AS author, p.isbn, p.document
            FROM issueHistory ih
            JOIN Product p ON ih.bookId = p.PK_Product_id
            WHERE ih.memberId = ?
            ORDER BY ih.issueDate DESC
        `, [memberId]);

        // Compute fine for each issue (3NF fix)
        const issuesWithFine = issues.map(computeIssueWithFine);
        
        res.json(issuesWithFine);
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
            'SELECT p.category as name, COUNT(*) as count FROM issueHistory ih JOIN Product p ON ih.bookId = p.PK_Product_id WHERE ih.memberId = ? GROUP BY p.category',
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
            ],
            genres: formattedGenres,
            activity: activity.map(act => ({
                month: act.month,
                count: parseInt(act.count, 10) || 0
            }))
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Members for a specific Book
export const getBookMembers = async (req, res) => {
    try {
        const { bookId } = req.params;

        const [members] = await db.query(`
            SELECT DISTINCT ih.id, m.id as memberId, m.name, m.email, m.membershipType, 
                   ih.issueDate, ih.returnDate, ih.status, ih.dueDate
            FROM issueHistory ih
            JOIN members m ON ih.memberId = m.id
            WHERE ih.bookId = ?
            ORDER BY ih.issueDate DESC
        `, [bookId]);

        res.json(members);
    } catch (error) {
        console.error('Get book members error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
