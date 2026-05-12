import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Admin Login
export const registerAdmin = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check if admin already exists
        const [existingAdmin] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
        if (existingAdmin.length > 0) {
            return res.status(400).json({ message: 'Admin with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert admin
        const [result] = await db.query(
            'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'admin']
        );

        res.status(201).json({ message: 'Admin registered successfully', adminId: result.insertId });
    } catch (error) {
        console.error('Register admin error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Admin Login
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const [admins] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);

        if (admins.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const admin = admins[0];

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.cookie('libraAdminToken', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.json({ message: 'Login successful', token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
    try {
        const [totalMembers] = await db.query('SELECT COUNT(*) as count FROM members');
        const [totalBooks] = await db.query('SELECT COUNT(*) as count FROM books');
        const [issuedBooks] = await db.query('SELECT COUNT(*) as count FROM issueHistory WHERE status = "issued"');
        const [overdueBooks] = await db.query('SELECT COUNT(*) as count FROM issueHistory WHERE status = "issued" AND dueDate < CURDATE()');

        res.json({
            totalMembers: totalMembers[0].count,
            totalBooks: totalBooks[0].count,
            issuedBooks: issuedBooks[0].count,
            overdueBooks: overdueBooks[0].count
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Admin Logout
export const adminLogout = (req, res) => {
    res.clearCookie('libraAdminToken');
    res.json({ message: 'Logged out successfully' });
};
