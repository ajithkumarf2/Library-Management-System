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
        const { roomId, bookingDate, startTime, endTime } = req.body;

        if (!roomId || !bookingDate || !startTime || !endTime) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if room exists
        const [room] = await db.query('SELECT * FROM studyrooms WHERE id = ?', [roomId]);
        if (room.length === 0) {
            return res.status(404).json({ message: 'Study room not found' });
        }

        // Insert booking
        const [result] = await db.query(
            'INSERT INTO studyroom_bookings (roomId, bookingDate, startTime, endTime) VALUES (?, ?, ?, ?)',
            [roomId, bookingDate, startTime, endTime]
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
            SELECT b.*, r.roomNumber 
            FROM studyroom_bookings b 
            JOIN studyrooms r ON b.roomId = r.id 
            ORDER BY b.bookingDate DESC, b.startTime DESC
        `);
        res.json(bookings);
    } catch (error) {
        console.error('Get study room bookings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
