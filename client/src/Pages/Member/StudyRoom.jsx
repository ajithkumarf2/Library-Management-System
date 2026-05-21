import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { FiCalendar, FiClock, FiInfo } from 'react-icons/fi'

const StudyRoom = () => {
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [bookings, setBookings] = useState([])
    const [showBooking, setShowBooking] = useState(false)
    const [bookingForm, setBookingForm] = useState({
        roomId: '',
        bookingDate: '',
        startTime: '',
        endTime: ''
    })

    useEffect(() => {
        fetchRoomsAndBookings()
    }, [])

    const fetchRoomsAndBookings = async () => {
        try {
            const [roomsRes, bookingsRes] = await Promise.all([
                axios.get('/studyroom/all').catch(() => ({ data: [] })),
                axios.get('/studyroom/member/bookings').catch(() => ({ data: [] }))
            ])
            setRooms(roomsRes.data || [])
            setBookings(bookingsRes.data || [])
        } catch (error) {
            console.error('Fetch study rooms error:', error)
            toast.error('Failed to fetch study rooms')
        } finally {
            setLoading(false)
        }
    }

    const handleBookingChange = (e) => {
        const { name, value } = e.target
        setBookingForm(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleBookRoom = async (e) => {
        e.preventDefault()
        if (!bookingForm.roomId || !bookingForm.bookingDate || !bookingForm.startTime || !bookingForm.endTime) {
            toast.error('Please fill in all fields')
            return
        }

        // Validate end time is after start time
        if (bookingForm.endTime <= bookingForm.startTime) {
            toast.error('End time must be after start time')
            return
        }

        try {
            const response = await axios.post('/studyroom/member/book', bookingForm)
            if (response.status === 201 || response.status === 200) {
                toast.success('Room booked successfully!')
                setBookingForm({ roomId: '', bookingDate: '', startTime: '', endTime: '' })
                setShowBooking(false)
                fetchRoomsAndBookings()
            }
        } catch (error) {
            console.error('Book room error:', error)
            toast.error(error.response?.data?.message || 'Failed to book room')
        }
    }

    const cancelBooking = async (bookingId) => {
        try {
            await axios.delete(`/studyroom/member/cancel/${bookingId}`)
            toast.success('Booking cancelled successfully')
            fetchRoomsAndBookings()
        } catch (error) {
            console.error('Cancel booking error:', error)
            toast.error(error.response?.data?.message || 'Failed to cancel booking')
        }
    }

    if (loading) {
        return <div className="text-center py-8 text-slate-500">Loading study rooms...</div>
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Study Rooms</h1>
                    <p className="text-slate-500 mt-1">Book a study room for focused learning</p>
                </div>
                <button
                    onClick={() => setShowBooking(!showBooking)}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                        showBooking
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    {showBooking ? 'Cancel' : 'Book a Room'}
                </button>
            </div>

            {/* Available Rooms Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <FiInfo className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div className="text-sm text-blue-800">
                    <p className="font-semibold">Available Rooms: {rooms.length}</p>
                    <p className="mt-1">Book a study room to get a quiet space for focused work. Each room has limited capacity.</p>
                </div>
            </div>

            {/* Booking Form */}
            {showBooking && (
                <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Book a Study Room</h2>
                    <form onSubmit={handleBookRoom} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-700 font-medium mb-2">Room *</label>
                                <select
                                    name="roomId"
                                    value={bookingForm.roomId}
                                    onChange={handleBookingChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">-- Select Room --</option>
                                    {rooms.map(room => (
                                        <option key={room.id} value={room.id}>
                                            {room.roomNumber} (Capacity: {room.capacity})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-700 font-medium mb-2">Booking Date *</label>
                                <input
                                    type="date"
                                    name="bookingDate"
                                    value={bookingForm.bookingDate}
                                    onChange={handleBookingChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 font-medium mb-2">Start Time *</label>
                                <input
                                    type="time"
                                    name="startTime"
                                    value={bookingForm.startTime}
                                    onChange={handleBookingChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 font-medium mb-2">End Time *</label>
                                <input
                                    type="time"
                                    name="endTime"
                                    value={bookingForm.endTime}
                                    onChange={handleBookingChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                            Book Room
                        </button>
                    </form>
                </div>
            )}

            {/* My Bookings */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">My Bookings</h2>
                
                {bookings.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-slate-500">No bookings yet. Click "Book a Room" to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bookings.map(booking => (
                            <div key={booking.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-lg text-slate-800">{booking.roomNumber || 'Study Room'}</h3>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        booking.status?.toLowerCase() === 'completed' 
                                            ? 'bg-slate-100 text-slate-600'
                                            : booking.status?.toLowerCase() === 'cancelled'
                                            ? 'bg-rose-100 text-rose-700'
                                            : 'bg-green-100 text-green-700'
                                    }`}>
                                        {booking.status || 'Confirmed'}
                                    </span>
                                </div>
                                
                                <div className="space-y-2 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <FiCalendar size={16} className="text-blue-600" />
                                        <span>{new Date(booking.bookingDate).toLocaleDateString('en-US', { 
                                            weekday: 'short', 
                                            month: 'short', 
                                            day: 'numeric' 
                                        })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FiClock size={16} className="text-blue-600" />
                                        <span>{booking.startTime} - {booking.endTime}</span>
                                    </div>
                                </div>

                                {booking.status?.toLowerCase() !== 'completed' && booking.status?.toLowerCase() !== 'cancelled' && (
                                    <button
                                        onClick={() => cancelBooking(booking.id)}
                                        className="mt-4 w-full py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Available Rooms List */}
            {rooms.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Available Study Rooms</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rooms.map(room => (
                            <div key={room.id} className="border-2 border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                <h3 className="font-bold text-lg text-slate-800 mb-2">{room.roomNumber}</h3>
                                <div className="text-sm text-slate-600">
                                    <p><span className="font-semibold">Capacity:</span> {room.capacity} people</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default StudyRoom
