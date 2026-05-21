import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register Member
export const registerMember = async (req, res) => {
    try {
        const { name, email, password, phone, membershipType, street, city, state, pincode } = req.body;

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

        let addressId = null;

        // Create address record if any address field is provided
        if (street || city || state || pincode) {
            const [addressResult] = await db.query(
                'INSERT INTO member_address (street, city, state, pincode) VALUES (?, ?, ?, ?)',
                [street || null, city || null, state || null, pincode || null]
            );
            addressId = addressResult.insertId;
        }

        // Insert member
        const [result] = await db.query(
            'INSERT INTO members (name, email, password, phone, membershipType, address_id) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone || null, membershipType || 'standard', addressId || null]
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
        const [members] = await db.query(`
            SELECT m.id, m.name, m.email, m.phone, m.membershipType, 
                   ma.id as addressId, ma.street, ma.city, ma.state, ma.pincode
            FROM members m
            LEFT JOIN member_address ma ON m.address_id = ma.id
            WHERE m.status = 'active'
        `);
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
        const [members] = await db.query(`
            SELECT m.*, ma.street, ma.city, ma.state, ma.pincode
            FROM members m
            LEFT JOIN member_address ma ON m.address_id = ma.id
            WHERE m.id = ?
        `, [memberId]);

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
        const { name, phone, membershipType, street, city, state, pincode } = req.body;

        let addressId = null;

        // Get current member to check existing address
        const [currentMember] = await db.query('SELECT address_id FROM members WHERE id = ?', [memberId]);
        if (currentMember.length === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // If address fields are provided, create or update address
        if (street !== undefined || city !== undefined || state !== undefined || pincode !== undefined) {
            const existingAddressId = currentMember[0].address_id;

            if (existingAddressId) {
                // Update existing address
                await db.query(
                    'UPDATE member_address SET street = ?, city = ?, state = ?, pincode = ? WHERE id = ?',
                    [street || null, city || null, state || null, pincode || null, existingAddressId]
                );
                addressId = existingAddressId;
            } else {
                // Create new address
                const [addressResult] = await db.query(
                    'INSERT INTO member_address (street, city, state, pincode) VALUES (?, ?, ?, ?)',
                    [street || null, city || null, state || null, pincode || null]
                );
                addressId = addressResult.insertId;
            }
        }

        // Build update query dynamically
        let updateQuery = 'UPDATE members SET ';
        let values = [];
        let updates = [];

        if (name !== undefined) {
            updates.push('name = ?');
            values.push(name);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            values.push(phone);
        }
        if (membershipType !== undefined) {
            updates.push('membershipType = ?');
            values.push(membershipType);
        }
        if (addressId !== null) {
            updates.push('address_id = ?');
            values.push(addressId);
        }

        if (updates.length === 0) {
            return res.json({ message: 'No updates provided' });
        }

        updateQuery += updates.join(', ') + ' WHERE id = ?';
        values.push(memberId);

        const [result] = await db.query(updateQuery, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete Member (Hard Delete for Member themselves)
export const deleteMember = async (req, res) => {
    try {
        const memberId = req.user.id;

        // Get address_id to clean up the member_address table
        const [memberRows] = await db.query('SELECT address_id FROM members WHERE id = ?', [memberId]);
        if (memberRows.length === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }
        const addressId = memberRows[0].address_id;

        // Hard delete the member
        const [result] = await db.query('DELETE FROM members WHERE id = ?', [memberId]);

        // Clean up the orphaned address row if it exists
        if (addressId) {
            await db.query('DELETE FROM member_address WHERE id = ?', [addressId]);
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
        const [members] = await db.query(`
            SELECT m.id, m.name, m.email, m.phone, m.membershipType, m.status, m.createdAt, m.updatedAt,
                   ma.id as addressId, ma.street, ma.city, ma.state, ma.pincode
            FROM members m
            LEFT JOIN member_address ma ON m.address_id = ma.id
            WHERE m.id = ?
        `, [id]);

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
        const { name, email, phone, membershipType, street, city, state, pincode } = req.body;

        // Get current member
        const [currentMembers] = await db.query('SELECT address_id FROM members WHERE id = ?', [id]);
        if (currentMembers.length === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }

        let addressId = null;

        // If address fields are provided, create or update address
        if (street !== undefined || city !== undefined || state !== undefined || pincode !== undefined) {
            const existingAddressId = currentMembers[0].address_id;

            if (existingAddressId) {
                // Update existing address
                await db.query(
                    'UPDATE member_address SET street = ?, city = ?, state = ?, pincode = ? WHERE id = ?',
                    [street || null, city || null, state || null, pincode || null, existingAddressId]
                );
                addressId = existingAddressId;
            } else {
                // Create new address
                const [addressResult] = await db.query(
                    'INSERT INTO member_address (street, city, state, pincode) VALUES (?, ?, ?, ?)',
                    [street || null, city || null, state || null, pincode || null]
                );
                addressId = addressResult.insertId;
            }
        }

        // Build update query
        let updateQuery = 'UPDATE members SET ';
        let values = [];
        let updates = [];

        if (name) {
            updates.push('name = ?');
            values.push(name);
        }
        if (email) {
            updates.push('email = ?');
            values.push(email);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            values.push(phone);
        }
        if (membershipType) {
            updates.push('membershipType = ?');
            values.push(membershipType);
        }
        if (addressId !== null) {
            updates.push('address_id = ?');
            values.push(addressId);
        }

        if (updates.length === 0) {
            return res.json({ message: 'No updates provided' });
        }

        updateQuery += updates.join(', ') + ' WHERE id = ?';
        values.push(id);

        const [result] = await db.query(updateQuery, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }

        res.json({ message: 'Member updated successfully' });
    } catch (error) {
        console.error('Update member error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete Member (Admin Hard Delete)
export const deleteMemberAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // Get address_id to clean up the member_address table
        const [memberRows] = await db.query('SELECT address_id FROM members WHERE id = ?', [id]);
        if (memberRows.length === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }
        const addressId = memberRows[0].address_id;

        // Hard delete the member
        const [result] = await db.query('DELETE FROM members WHERE id = ?', [id]);

        // Clean up the orphaned address row if it exists
        if (addressId) {
            await db.query('DELETE FROM member_address WHERE id = ?', [addressId]);
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
