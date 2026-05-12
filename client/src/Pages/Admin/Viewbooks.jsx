import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import axios from 'axios'

const Viewbooks = () => {
    const navigate = useNavigate()
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchBooks()
    }, [])

    const fetchBooks = async () => {
        try {
            const response = await axios.get('/books/all')
            setBooks(response.data)
        } catch (error) {
            console.error('Fetch books error:', error)
            toast.error('Failed to fetch books')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                const response = await axios.delete(`/books/delete/${id}`)
                if (response.status === 200) {
                    toast.success('Book deleted successfully!')
                    fetchBooks()
                }
            } catch (error) {
                console.error('Delete book error:', error)
                toast.error('Failed to delete book')
            }
        }
    }


    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return <div className="text-center py-8">Loading books...</div>
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">All Books</h2>
                <button
                    onClick={() => navigate('/dashboard/addbooks')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                    Add Book
                </button>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by title or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold">Title</th>
                            <th className="px-4 py-3 text-left font-semibold">Author</th>
                            <th className="px-4 py-3 text-left font-semibold">ISBN</th>
                            <th className="px-4 py-3 text-left font-semibold">Category</th>
                            <th className="px-4 py-3 text-left font-semibold">Quantity</th>
                            <th className="px-4 py-3 text-left font-semibold">Available</th>
                            <th className="px-4 py-3 text-left font-semibold">Location</th>
                            <th className="px-4 py-3 text-left font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBooks.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                                    No books found
                                </td>
                            </tr>
                        ) : (
                            filteredBooks.map(book => (
                                <tr key={book.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">{book.title}</td>
                                    <td className="px-4 py-3">{book.author}</td>
                                    <td className="px-4 py-3">{book.isbn || '-'}</td>
                                    <td className="px-4 py-3">{book.category || '-'}</td>
                                    <td className="px-4 py-3">{book.quantity}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-3 py-1 rounded-full text-white ${book.availableQuantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {book.availableQuantity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{book.shelfLocation || '-'}</td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <button
                                            onClick={() => handleDelete(book.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 size={20} />
                                        </button>
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

export default Viewbooks