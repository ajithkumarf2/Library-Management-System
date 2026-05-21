import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'

// Helper function to calculate fine (₹1 per day)
const calculateFine = (returnDate, dueDate) => {
    if (!returnDate) return 0;
    const returnD = new Date(returnDate);
    const dueD = new Date(dueDate);
    const daysOverdue = Math.floor((returnD - dueD) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysOverdue) * 1; // ₹1 per day
};


const Returnedbook = () => {
    const [issuedBooks, setIssuedBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [returning, setReturning] = useState(null)

    useEffect(() => {
        fetchIssuedBooks()
    }, [])

    const fetchIssuedBooks = async () => {
        try {
            const response = await axios.get('/issues/issued')
            setIssuedBooks(response.data)
        } catch (error) {
            console.error('Fetch issued books error:', error)
            toast.error('Failed to fetch issued books')
        } finally {
            setLoading(false)
        }
    }

    const handleReturn = async (issueId) => {
        setReturning(issueId)
        try {
            const response = await axios.put(`/issues/return/${issueId}`, {})
            if (response.status === 200) {
                toast.success('Book returned successfully!')
                fetchIssuedBooks()
            }
        } catch (error) {
            console.error('Return book error:', error)
            toast.error(error.response?.data?.message || 'Failed to return book')
        } finally {
            setReturning(null)
        }
    }


    if (loading) {
        return <div className="text-center py-8">Loading issued books...</div>
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Return Books</h2>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold">Book Title</th>
                            <th className="px-4 py-3 text-left font-semibold">Member Name</th>
                            <th className="px-4 py-3 text-left font-semibold">Issue Date & Time</th>
                            <th className="px-4 py-3 text-left font-semibold">Due Date</th>
                            <th className="px-4 py-3 text-left font-semibold">Fine (₹)</th>
                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                            <th className="px-4 py-3 text-left font-semibold">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {issuedBooks.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                                    No issued books
                                </td>
                            </tr>
                        ) : (
                            issuedBooks.map(issue => {
                                const isOverdue = new Date(issue.dueDate) < new Date()
                                const fine = isOverdue ? calculateFine(new Date().toISOString().split('T')[0], issue.dueDate) : 0
                                return (
                                    <tr key={issue.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3">{issue.bookTitle || 'N/A'}</td>
                                        <td className="px-4 py-3">{issue.memberName || 'N/A'}</td>
                                        <td className="px-4 py-3">
                                            {new Date(issue.issueDate).toLocaleDateString()} {new Date(issue.issueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-4 py-3">{new Date(issue.dueDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 font-semibold text-red-600">
                                            {fine > 0 ? `₹${fine}` : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-3 py-1 rounded-full text-white ${isOverdue ? 'bg-red-500' : 'bg-yellow-500'}`}>
                                                {isOverdue ? 'Overdue' : 'Issued'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleReturn(issue.id)}
                                                disabled={returning === issue.id}
                                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
                                            >
                                                {returning === issue.id ? 'Processing...' : 'Return'}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Returnedbook