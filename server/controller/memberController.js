import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register Member
export const registerMember = async (req, res) => {
    try {
        const { name, email, password, phone, membershipType, address } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check if member already exists
        const [existingMember] = await db.query('SELECT * FROM members WHERE email = ?', [email]);
        
        if (existingMember.length > 0) {
            return res.status(400).json({ message: 'Member with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert member
        const [result] = await db.query(
            'INSERT INTO members (name, email, password, phone, membershipType, address) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone || null, membershipType || 'standard', address || null]
        );

        res.status(201).json({ message: 'Member registered successfully', memberId: result.insertId });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get All Members
export const getAllMembers = async (req, res) => {
    try {
        const [members] = await db.query('SELECT id, name, email, phone, membershipType, address FROM members WHERE status = "active"');
        res.json(members);
    } catch (error) {
        console.error('Get all members error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Login Member
export const loginMember = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const [members] = await db.query('SELECT * FROM members WHERE email = ?', [email]);

        if (members.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const member = members[0];

        const isPasswordValid = await bcrypt.compare(password, member.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: member.id, email: member.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.cookie('libraToken', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.json({ message: 'Login successful', token, member: { id: member.id, name: member.name, email: member.email } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Member Profile
export const getMemberProfile = async (req, res) => {
    try {
        const memberId = req.user.id;
        const [members] = await db.query('SELECT * FROM members WHERE id = ?', [memberId]);

        if (members.length === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }

        const member = members[0];
        delete member.password;

        res.json(member);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Member Profile
export const updateMemberProfile = async (req, res) => {
    try {
        const memberId = req.user.id;
        const { name, phone, membershipType, address } = req.body;

        const [result] = await db.query(
            'UPDATE members SET name = ?, phone = ?, membershipType = ?, address = ? WHERE id = ?',
            [name || null, phone || null, membershipType || 'standard', address || null, memberId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete Member (Soft Delete for Member themselves)
export const deleteMember = async (req, res) => {
    try {
        const memberId = req.user.id;

        const [result] = await db.query('UPDATE members SET status = "inactive" WHERE id = ?', [memberId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }

        res.json({ message: 'Member deleted successfully' });
    } catch (error) {
        console.error('Delete member error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Get Member By ID (Admin)
export const getMemberById = async (req, res) => {
    try {
        const { id } = req.params;
        const [members] = await db.query('SELECT id, name, email, phone, membershipType, address FROM members WHERE id = ?', [id]);

        if (members.length === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }

        res.json(members[0]);
    } catch (error) {
        console.error('Get member by ID error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Member (Admin)
export const updateMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, membershipType, address } = req.body;

        const [result] = await db.query(
            'UPDATE members SET name = ?, email = ?, phone = ?, membershipType = ?, address = ? WHERE id = ?',
            [name, email, phone || null, membershipType || 'standard', address || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }

        res.json({ message: 'Member updated successfully' });
    } catch (error) {
        console.error('Update member error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete Member (Admin)
export const deleteMemberAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('UPDATE members SET status = "inactive" WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }

        res.json({ message: 'Member deleted successfully' });
    } catch (error) {
        console.error('Delete member error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Logout
export const logoutMember = (req, res) => {
    res.clearCookie('libraToken');
    res.json({ message: 'Logged out successfully' });
};
