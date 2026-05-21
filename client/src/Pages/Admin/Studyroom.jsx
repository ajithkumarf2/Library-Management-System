import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'


const Studyroom = () => {
    const [rooms, setRooms] = useState([])
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [bookings, setBookings] = useState([])
    const [showBooking, setShowBooking] = useState(false)
    const [showCreate, setShowCreate] = useState(false)
    const [bookingForm, setBookingForm] = useState({
        memberId: '',
        roomId: '',
        bookingDate: '',
        startTime: '',
        endTime: ''
    })
    const [createForm, setCreateForm] = useState({
        roomNumber: '',
        capacity: ''
    })

    useEffect(() => {
        fetchRoomsAndBookings()
    }, [])

    const fetchRoomsAndBookings = async () => {
        try {
            const [roomsRes, bookingsRes, membersRes] = await Promise.all([
                axios.get('/studyroom/all').catch(() => ({ data: [] })),
                axios.get('/studyroom/bookings').catch(() => ({ data: [] })),
                axios.get('/members/all').catch(() => ({ data: [] }))
            ])
            setRooms(roomsRes.data || [])
            setBookings(bookingsRes.data || [])
            setMembers(membersRes.data || [])
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

    const handleCreateChange = (e) => {
        const { name, value } = e.target
        setCreateForm(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleBookRoom = async (e) => {
        e.preventDefault()
        if (!bookingForm.memberId || !bookingForm.roomId || !bookingForm.bookingDate || !bookingForm.startTime || !bookingForm.endTime) {
            toast.error('Please fill in all fields')
            return
        }

        try {
            const response = await axios.post('/studyroom/book', {
                ...bookingForm,
                memberId: parseInt(bookingForm.memberId, 10)
            })
            if (response.status === 201 || response.status === 200) {
                toast.success('Room booked successfully!')
                setBookingForm({ memberId: '', roomId: '', bookingDate: '', startTime: '', endTime: '' })
                setShowBooking(false)
                fetchRoomsAndBookings()
            }
        } catch (error) {
            console.error('Book room error:', error)
            toast.error(error.response?.data?.message || 'Failed to book room')
        }
    }

    const handleCreateRoom = async (e) => {
        e.preventDefault()
        if (!createForm.roomNumber || !createForm.capacity) {
            toast.error('Please fill in all fields')
            return
        }

        try {
            const response = await axios.post('/studyroom/add', createForm)
            if (response.status === 201 || response.status === 200) {
                toast.success('Room created successfully!')
                setCreateForm({ roomNumber: '', capacity: '' })
                setShowCreate(false)
                fetchRoomsAndBookings()
            }
        } catch (error) {
            console.error('Create room error:', error)
            toast.error(error.response?.data?.message || 'Failed to create room')
        }
    }


    if (loading) {
        return <div className="text-center py-8">Loading study rooms...</div>
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Study Rooms</h2>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            setShowCreate(!showCreate)
                            setShowBooking(false)
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        {showCreate ? 'Cancel' : 'Create Room'}
                    </button>
                    <button
                        onClick={() => {
                            setShowBooking(!showBooking)
                            setShowCreate(false)
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        {showBooking ? 'Cancel' : 'Book Room'}
                    </button>
                </div>
            </div>

            {showCreate && (
                <div className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-green-200">
                    <h3 className="text-xl font-bold mb-4 text-green-800">Create New Study Room</h3>
                    <form onSubmit={handleCreateRoom} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Room Number *</label>
                                <input
                                    type="text"
                                    name="roomNumber"
                                    value={createForm.roomNumber}
                                    onChange={handleCreateChange}
                                    placeholder="e.g. Room 101"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Capacity *</label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={createForm.capacity}
                                    onChange={handleCreateChange}
                                    placeholder="e.g. 10"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            Add Room
                        </button>
                    </form>
                </div>
            )}

            {showBooking && (
                <div className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-blue-200">
                    <h3 className="text-xl font-bold mb-4 text-blue-800">Book a Study Room</h3>
                    <form onSubmit={handleBookRoom} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Select Member *</label>
                                <select
                                    name="memberId"
                                    value={bookingForm.memberId}
                                    onChange={handleBookingChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">-- Select Member --</option>
                                    {members.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.name} ({member.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Room *</label>
                                <select
                                    name="roomId"
                                    value={bookingForm.roomId}
                                    onChange={handleBookingChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                <label className="block text-gray-700 font-medium mb-2">Booking Date *</label>
                                <input
                                    type="date"
                                    name="bookingDate"
                                    value={bookingForm.bookingDate}
                                    onChange={handleBookingChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Start Time *</label>
                                <input
                                    type="time"
                                    name="startTime"
                                    value={bookingForm.startTime}
                                    onChange={handleBookingChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">End Time *</label>
                                <input
                                    type="time"
                                    name="endTime"
                                    value={bookingForm.endTime}
                                    onChange={handleBookingChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            Book Now
                        </button>
                    </form>
                </div>
            )}

            <h3 className="text-2xl font-bold mb-4">All Bookings</h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold">Room</th>
                            <th className="px-4 py-3 text-left font-semibold">Member</th>
                            <th className="px-4 py-3 text-left font-semibold">Date</th>
                            <th className="px-4 py-3 text-left font-semibold">Time</th>
                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                                    No bookings
                                </td>
                            </tr>
                        ) : (
                            bookings.map(booking => (
                                <tr key={booking.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">{booking.roomNumber || 'N/A'}</td>
                                    <td className="px-4 py-3">
                                        {booking.memberName ? (
                                            <div>
                                                <div className="font-semibold text-gray-800">{booking.memberName}</div>
                                                <div className="text-xs text-gray-500">{booking.memberEmail}</div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">{booking.startTime} - {booking.endTime}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-3 py-1 rounded-full text-white bg-blue-500">
                                            {booking.status || 'Confirmed'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Studyroom