import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'


const Issuedbook = () => {
    const [members, setMembers] = useState([])
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [formLoading, setFormLoading] = useState(false)
    const [formData, setFormData] = useState({
        memberId: '',
        bookId: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: ''
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [membersRes, booksRes] = await Promise.all([
                axios.get('/members/all'),
                axios.get('/books/all')
            ])
            setMembers(membersRes.data)
            setBooks(booksRes.data)
        } catch (error) {
            console.error('Fetch data error:', error)
            toast.error('Failed to fetch data')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.memberId || !formData.bookId || !formData.dueDate) {
            toast.error('Please fill in all fields')
            return
        }

        setFormLoading(true)
        try {
            const response = await axios.post('/issues/issue', {
                memberId: parseInt(formData.memberId),
                bookId: parseInt(formData.bookId),
                issueDate: formData.issueDate,
                dueDate: formData.dueDate,
                status: 'issued'
            })

            if (response.status === 201 || response.status === 200) {
                toast.success('Book issued successfully!')
                setFormData({
                    memberId: '',
                    bookId: '',
                    issueDate: new Date().toISOString().split('T')[0],
                    dueDate: ''
                })
            }
        } catch (error) {
            console.error('Issue book error:', error)
            toast.error(error.response?.data?.message || 'Failed to issue book')
        } finally {
            setFormLoading(false)
        }
    }


    if (loading) {
        return <div className="text-center py-8">Loading...</div>
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Issue Book</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Select Member *</label>
                    <select
                        name="memberId"
                        value={formData.memberId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-gray-700 font-medium mb-2">Select Book *</label>
                    <select
                        name="bookId"
                        value={formData.bookId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Select Book --</option>
                        {books.map(book => (
                            <option key={book.id} value={book.id} disabled={book.availableQuantity === 0}>
                                {book.title} by {book.author} (Available: {book.availableQuantity})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Issue Date</label>
                        <input
                            type="date"
                            name="issueDate"
                            value={formData.issueDate}
                            onChange={handleChange}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Due Date *</label>
                        <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50"
                >
                    {formLoading ? 'Issuing...' : 'Issue Book'}
                </button>
            </form>
        </div>
    )
}

export default Issuedbook