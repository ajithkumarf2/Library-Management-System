import express from 'express';
import { 
    addStudyRoom, 
    getAllStudyRooms, 
    updateRoomStatus, 
    deleteStudyRoom,
    bookStudyRoom,
    getStudyRoomBookings
} from '../controller/studyRoomController.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.post('/add', verifyAdmin, addStudyRoom);
router.get('/all', verifyAdmin, getAllStudyRooms);
router.put('/update/:id', verifyAdmin, updateRoomStatus);
router.delete('/delete/:id', verifyAdmin, deleteStudyRoom);
router.post('/book', verifyAdmin, bookStudyRoom);
router.get('/bookings', verifyAdmin, getStudyRoomBookings);

export default router;
