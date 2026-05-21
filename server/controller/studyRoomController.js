import db from '../config/db.js';

// Add Study Room
export const addStudyRoom = async (req, res) => {
    try {
        const { roomNumber, capacity } = req.body;

        if (!roomNumber || !capacity) {
            return res.status(400).json({ message: 'Room number and capacity are required' });
        }

        const [result] = await db.query(
            'INSERT INTO studyrooms (roomNumber, capacity, availableSeats) VALUES (?, ?, ?)',
            [roomNumber, capacity, capacity]
        );

        res.status(201).json({ message: 'Study room added successfully', roomId: result.insertId });
    } catch (error) {
        console.error('Add study room error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get All Study Rooms
export const getAllStudyRooms = async (req, res) => {
    try {
        const [rooms] = await db.query('SELECT * FROM studyrooms');
        res.json(rooms);
    } catch (error) {
        console.error('Get all study rooms error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Study Room Availability
export const updateRoomStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, availableSeats } = req.body;

        const [result] = await db.query(
            'UPDATE studyrooms SET status = ?, availableSeats = ? WHERE id = ?',
            [status, availableSeats, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Study room not found' });
        }

        res.json({ message: 'Study room updated successfully' });
    } catch (error) {
        console.error('Update study room error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete Study Room
export const deleteStudyRoom = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM studyrooms WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Study room not found' });
        }

        res.json({ message: 'Study room deleted successfully' });
    } catch (error) {
        console.error('Delete study room error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Book a Study Room
export const bookStudyRoom = async (req, res) => {
    try {
        const { memberId, roomId, bookingDate, startTime, endTime } = req.body;

        if (!memberId || !roomId || !bookingDate || !startTime || !endTime) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate memberId (Issue 3 fix: ensure valid FK reference)
        if (memberId <= 0) {
            return res.status(400).json({ message: 'Invalid member ID' });
        }

        const [members] = await db.query('SELECT id FROM members WHERE id = ?', [memberId]);
        if (members.length === 0) {
            return res.status(400).json({ message: 'Member not found' });
        }

        // Check if room exists
        const [room] = await db.query('SELECT * FROM studyrooms WHERE id = ?', [roomId]);
        if (room.length === 0) {
            return res.status(404).json({ message: 'Study room not found' });
        }

        // Insert booking
        const [result] = await db.query(
            'INSERT INTO studyroom_bookings (memberId, roomId, bookingDate, startTime, endTime) VALUES (?, ?, ?, ?, ?)',
            [memberId, roomId, bookingDate, startTime, endTime]
        );

        res.status(201).json({ message: 'Study room booked successfully', bookingId: result.insertId });
    } catch (error) {
        console.error('Book study room error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get All Study Room Bookings
export const getStudyRoomBookings = async (req, res) => {
    try {
        const [bookings] = await db.query(`
            SELECT b.*, r.roomNumber, m.name as memberName, m.email as memberEmail 
            FROM studyroom_bookings b 
            JOIN studyrooms r ON b.roomId = r.id 
            LEFT JOIN members m ON b.memberId = m.id
            ORDER BY b.bookingDate DESC, b.startTime DESC
        `);
        res.json(bookings);
    } catch (error) {
        console.error('Get study room bookings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Member: Get their Study Room Bookings
export const getMemberStudyRoomBookings = async (req, res) => {
    try {
        const memberId = req.memberId; // From auth middleware

        const [bookings] = await db.query(`
            SELECT b.*, r.roomNumber 
            FROM studyroom_bookings b 
            JOIN studyrooms r ON b.roomId = r.id 
            WHERE b.memberId = ?
            ORDER BY b.bookingDate DESC, b.startTime DESC
        `, [memberId]);
        
        res.json(bookings);
    } catch (error) {
        console.error('Get member study room bookings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Member: Book a Study Room
export const bookMemberStudyRoom = async (req, res) => {
    try {
        const memberId = req.memberId; // From auth middleware
        const { roomId, bookingDate, startTime, endTime } = req.body;

        if (!roomId || !bookingDate || !startTime || !endTime) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate memberId (Issue 3 fix: ensure valid FK reference)
        if (!memberId || memberId <= 0) {
            return res.status(400).json({ message: 'Invalid member authentication' });
        }

        // Check if room exists
        const [room] = await db.query('SELECT * FROM studyrooms WHERE id = ?', [roomId]);
        if (room.length === 0) {
            return res.status(404).json({ message: 'Study room not found' });
        }

        // Insert booking with validated member ID
        const [result] = await db.query(
            'INSERT INTO studyroom_bookings (memberId, roomId, bookingDate, startTime, endTime) VALUES (?, ?, ?, ?, ?)',
            [memberId, roomId, bookingDate, startTime, endTime]
        );

        res.status(201).json({ message: 'Study room booked successfully', bookingId: result.insertId });
    } catch (error) {
        console.error('Book member study room error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Member: Cancel a Booking
export const cancelMemberBooking = async (req, res) => {
    try {
        const memberId = req.memberId; // From auth middleware
        const { bookingId } = req.params;

        // Check if booking exists and belongs to member
        const [booking] = await db.query(
            'SELECT * FROM studyroom_bookings WHERE id = ? AND memberId = ?',
            [bookingId, memberId]
        );

        if (booking.length === 0) {
            return res.status(404).json({ message: 'Booking not found or does not belong to you' });
        }

        // Update status to cancelled
        const [result] = await db.query(
            'UPDATE studyroom_bookings SET status = ? WHERE id = ?',
            ['cancelled', bookingId]
        );

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Cancel member booking error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
