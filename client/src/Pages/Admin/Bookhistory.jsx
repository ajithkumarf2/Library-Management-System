import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'

const Bookhistory = () => {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchHistory()
    }, [filter])

    const fetchHistory = async () => {
        setLoading(true)
        try {
            let response
            if (filter === 'issued') {
                response = await axios.get('/issues/issued')
            } else if (filter === 'returned') {
                response = await axios.get('/issues/returned')
            } else if (filter === 'overdue') {
                response = await axios.get('/issues/overdue')
            } else {
                response = await axios.get('/issues/history')
            }
            setHistory(response.data)
        } catch (error) {
            console.error('Fetch history error:', error)
            toast.error('Failed to fetch history')
        } finally {
            setLoading(false)
        }
    }


    if (loading) {
        return <div className="text-center py-8">Loading history...</div>
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Book Issue History</h2>

            <div className="mb-6 flex gap-4 flex-wrap">
                {['all', 'issued', 'returned', 'overdue'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${filter === f
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold">Book</th>
                            <th className="px-4 py-3 text-left font-semibold">Member</th>
                            <th className="px-4 py-3 text-left font-semibold">Issue Date</th>
                            <th className="px-4 py-3 text-left font-semibold">Return Date</th>
                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            history.map(record => (
                                <tr key={record.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">{record.bookTitle || 'N/A'}</td>
                                    <td className="px-4 py-3">{record.memberName || 'N/A'}</td>
                                    <td className="px-4 py-3">{new Date(record.issueDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">{record.returnDate ? new Date(record.returnDate).toLocaleDateString() : '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-3 py-1 rounded-full text-white ${record.status === 'issued' ? 'bg-yellow-500' :
                                                record.status === 'returned' ? 'bg-green-500' :
                                                    'bg-red-500'
                                            }`}>
                                            {record.status?.charAt(0).toUpperCase() + record.status?.slice(1)}
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

export default Bookhistory