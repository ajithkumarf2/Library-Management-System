import db from '../config/db.js';
import crypto from 'crypto';

// Add Study Room
export const addStudyRoom = async (req, res) => {
    try {
        const { roomNumber, capacity } = req.body;

        if (!roomNumber || !capacity) {
            return res.status(400).json({ message: 'Room number and capacity are required' });
        }

        // Generate 16-digit hexadecimal key
        const hexKey = crypto.randomBytes(8).toString('hex');

        const [result] = await db.query(
            'INSERT INTO Study_Room (Study_Room_Number, Study_Room_Capacity, Study_Room_Available_Seats, PK_Study_Room_KEY) VALUES (?, ?, ?, ?)',
            [roomNumber, capacity, capacity, hexKey]
        );

        res.status(201).json({ message: 'Study room added successfully', roomId: result.insertId, productKey: hexKey });
    } catch (error) {
        console.error('Add study room error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get All Study Rooms
export const getAllStudyRooms = async (req, res) => {
    try {
        const [rooms] = await db.query(
            'SELECT PK_Study_Room_id as id, Study_Room_Number as roomNumber, Study_Room_Capacity as capacity, Study_Room_Available_Seats as availableSeats, PK_Study_Room_KEY, status, createdAt, updatedAt FROM Study_Room'
        );
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
            'UPDATE Study_Room SET status = ?, Study_Room_Available_Seats = ? WHERE PK_Study_Room_id = ?',
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

        const [result] = await db.query('DELETE FROM Study_Room WHERE PK_Study_Room_id = ?', [id]);

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

        // Check if room exists and get its PK_Study_Room_KEY
        const [room] = await db.query('SELECT PK_Study_Room_KEY FROM Study_Room WHERE PK_Study_Room_id = ?', [roomId]);
        if (room.length === 0) {
            return res.status(404).json({ message: 'Study room not found' });
        }

        const studyRoomKey = room[0].PK_Study_Room_KEY;

        // Insert booking referencing FK_Study_Room_KEY
        const [result] = await db.query(
            'INSERT INTO Study_Room_Booking (FK_Member_id, FK_Study_Room_KEY, SRB_Date, SRB_Start_Time, SRB_End_Time) VALUES (?, ?, ?, ?, ?)',
            [memberId, studyRoomKey, bookingDate, startTime, endTime]
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
            SELECT 
                b.PK_SRB_ID as id, 
                b.FK_Member_id as memberId, 
                b.FK_Study_Room_KEY as studyRoomKey, 
                b.SRB_Date as bookingDate, 
                b.SRB_Start_Time as startTime, 
                b.SRB_End_Time as endTime, 
                b.status, 
                b.createdAt, 
                r.PK_Study_Room_id as roomId,
                r.Study_Room_Number as roomNumber, 
                m.name as memberName, 
                m.email as memberEmail 
            FROM Study_Room_Booking b 
            JOIN Study_Room r ON b.FK_Study_Room_KEY = r.PK_Study_Room_KEY 
            LEFT JOIN members m ON b.FK_Member_id = m.id
            ORDER BY b.SRB_Date DESC, b.SRB_Start_Time DESC
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
            SELECT 
                b.PK_SRB_ID as id, 
                b.FK_Member_id as memberId, 
                b.FK_Study_Room_KEY as studyRoomKey, 
                b.SRB_Date as bookingDate, 
                b.SRB_Start_Time as startTime, 
                b.SRB_End_Time as endTime, 
                b.status, 
                b.createdAt, 
                r.PK_Study_Room_id as roomId,
                r.Study_Room_Number as roomNumber 
            FROM Study_Room_Booking b 
            JOIN Study_Room r ON b.FK_Study_Room_KEY = r.PK_Study_Room_KEY 
            WHERE b.FK_Member_id = ?
            ORDER BY b.SRB_Date DESC, b.SRB_Start_Time DESC
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

        // Check if room exists and get PK_Study_Room_KEY
        const [room] = await db.query('SELECT PK_Study_Room_KEY FROM Study_Room WHERE PK_Study_Room_id = ?', [roomId]);
        if (room.length === 0) {
            return res.status(404).json({ message: 'Study room not found' });
        }

        const studyRoomKey = room[0].PK_Study_Room_KEY;

        // Insert booking with validated member ID and FK_Study_Room_KEY
        const [result] = await db.query(
            'INSERT INTO Study_Room_Booking (FK_Member_id, FK_Study_Room_KEY, SRB_Date, SRB_Start_Time, SRB_End_Time) VALUES (?, ?, ?, ?, ?)',
            [memberId, studyRoomKey, bookingDate, startTime, endTime]
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
            'SELECT * FROM Study_Room_Booking WHERE PK_SRB_ID = ? AND FK_Member_id = ?',
            [bookingId, memberId]
        );

        if (booking.length === 0) {
            return res.status(404).json({ message: 'Booking not found or does not belong to you' });
        }

        // Update status to cancelled
        const [result] = await db.query(
            'UPDATE Study_Room_Booking SET status = ? WHERE PK_SRB_ID = ?',
            ['cancelled', bookingId]
        );

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Cancel member booking error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
