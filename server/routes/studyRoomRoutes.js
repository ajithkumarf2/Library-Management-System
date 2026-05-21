import express from 'express';
import { 
    addStudyRoom, 
    getAllStudyRooms, 
    updateRoomStatus, 
    deleteStudyRoom,
    bookStudyRoom,
    getStudyRoomBookings,
    getMemberStudyRoomBookings,
    bookMemberStudyRoom,
    cancelMemberBooking
} from '../controller/studyRoomController.js';
import { verifyAdmin, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.post('/add', verifyAdmin, addStudyRoom);
router.get('/all', getAllStudyRooms); // Public route - allow both admin and members
router.put('/update/:id', verifyAdmin, updateRoomStatus);
router.delete('/delete/:id', verifyAdmin, deleteStudyRoom);
router.post('/book', verifyAdmin, bookStudyRoom);
router.get('/bookings', verifyAdmin, getStudyRoomBookings);

// Member routes
router.get('/member/bookings', verifyToken, getMemberStudyRoomBookings);
router.post('/member/book', verifyToken, bookMemberStudyRoom);
router.delete('/member/cancel/:bookingId', verifyToken, cancelMemberBooking);

export default router;
