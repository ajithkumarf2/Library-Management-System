import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Trash2, Edit } from 'lucide-react'
import { FiEye, FiArrowUp, FiArrowDown, FiFilter } from 'react-icons/fi'
import axios from 'axios'

const Viewbooks = () => {
    const navigate = useNavigate()
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortOrder, setSortOrder] = useState('default')
    const [filterCategory, setFilterCategory] = useState('all')
    const [showFilterDropdown, setShowFilterDropdown] = useState(false)
    const [categories, setCategories] = useState([])
    const [selectedBook, setSelectedBook] = useState(null)
    const [bookMembers, setBookMembers] = useState([])
    const [showMembersModal, setShowMembersModal] = useState(false)
    const [membersLoading, setMembersLoading] = useState(false)

    useEffect(() => {
        fetchBooks()
    }, [])

    const fetchBooks = async () => {
        try {
            const response = await axios.get('/books/all')
            setBooks(response.data)
            
            // Extract unique categories
            const uniqueCategories = ['all', ...new Set(response.data.map(book => book.category).filter(Boolean))]
            setCategories(uniqueCategories)
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

    const handleViewMembers = async (book) => {
        setSelectedBook(book)
        setShowMembersModal(true)
        setMembersLoading(true)
        try {
            const response = await axios.get(`/issues/book/${book.id}`)
            setBookMembers(response.data)
        } catch (error) {
            console.error('Fetch book members error:', error)
            toast.error('Failed to fetch members')
            setBookMembers([])
        } finally {
            setMembersLoading(false)
        }
    }

    const handleSearchInput = (value) => {
        setSearchTerm(value)
    }

    const getFilterLabel = () => {
        if (filterCategory === 'all') return 'All Categories'
        return filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1)
    }

    const getSortedBooks = () => {
        let sorted = [...filteredBooks]
        
        if (sortOrder === 'a-z') {
            sorted.sort((a, b) => a.title.localeCompare(b.title))
        } else if (sortOrder === 'z-a') {
            sorted.sort((a, b) => b.title.localeCompare(a.title))
        } else if (sortOrder === 'new-old') {
            sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        } else if (sortOrder === 'old-new') {
            sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
        }
        
        return sorted
    }


    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             book.author.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterCategory === 'all' || book.category === filterCategory
        return matchesSearch && matchesFilter
    })

    if (loading) {
        return <div className="text-center py-8">Loading books...</div>
    }

    const sortedBooks = getSortedBooks()

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

            <div className="mb-6 flex gap-3">
                <input
                    type="text"
                    placeholder="Search by title or author..."
                    value={searchTerm}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="relative">
                    <button
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold flex items-center gap-2 transition"
                    >
                        <FiFilter size={18} />
                        {getFilterLabel()}
                    </button>
                    
                    {showFilterDropdown && (
                        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-56">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => {
                                        setFilterCategory(category)
                                        setShowFilterDropdown(false)
                                    }}
                                    className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                                        filterCategory === category 
                                            ? 'bg-blue-100 text-blue-800 font-semibold' 
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-6 flex gap-2 flex-wrap">
                <button
                    onClick={() => setSortOrder('a-z')}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition ${
                        sortOrder === 'a-z' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                >
                    <FiArrowUp size={16} /> A-Z
                </button>
                <button
                    onClick={() => setSortOrder('z-a')}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition ${
                        sortOrder === 'z-a' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                >
                    <FiArrowDown size={16} /> Z-A
                </button>
                <button
                    onClick={() => setSortOrder('new-old')}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition ${
                        sortOrder === 'new-old' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                >
                    <FiArrowDown size={16} /> New to Old
                </button>
                <button
                    onClick={() => setSortOrder('old-new')}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition ${
                        sortOrder === 'old-new' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                >
                    <FiArrowUp size={16} /> Old to New
                </button>
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
                            <th className="px-4 py-3 text-left font-semibold">Doc</th>
                            <th className="px-4 py-3 text-left font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedBooks.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="px-4 py-4 text-center text-gray-500">
                                    No books found
                                </td>
                            </tr>
                        ) : (
                            sortedBooks.map(book => (
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
                                    <td className="px-4 py-3">
                                        {book.document ? (
                                            <span className="text-green-600 font-bold" title={book.document}>Yes</span>
                                        ) : (
                                            <span className="text-gray-400">No</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 flex gap-3">
                                        <button
                                            onClick={() => handleViewMembers(book)}
                                            className="text-green-600 hover:text-green-800"
                                            title="View members who issued this book"
                                        >
                                            <FiEye size={20} />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/dashboard/editbook/${book.id}`)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Edit Book"
                                        >
                                            <Edit size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(book.id)}
                                            className="text-red-600 hover:text-red-800"
                                            title="Delete Book"
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

            {/* Members Modal */}
            {showMembersModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-96 overflow-y-auto">
                        <div className="sticky top-0 bg-gray-200 px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-gray-800">
                                Members who issued "{selectedBook?.title}"
                            </h3>
                            <button
                                onClick={() => setShowMembersModal(false)}
                                className="text-gray-600 hover:text-gray-900 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="p-6">
                            {membersLoading ? (
                                <div className="text-center py-8">Loading members...</div>
                            ) : bookMembers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No members have issued this book
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold">Member Name</th>
                                                <th className="px-4 py-3 text-left font-semibold">Email</th>
                                                <th className="px-4 py-3 text-left font-semibold">Membership Type</th>
                                                <th className="px-4 py-3 text-left font-semibold">Issue Date</th>
                                                <th className="px-4 py-3 text-left font-semibold">Return Date</th>
                                                <th className="px-4 py-3 text-left font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookMembers.map((member, index) => (
                                                <tr key={index} className="border-b hover:bg-gray-50">
                                                    <td className="px-4 py-3">{member.name || 'N/A'}</td>
                                                    <td className="px-4 py-3">{member.email || 'N/A'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                            {member.membershipType || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {member.issueDate ? new Date(member.issueDate).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {member.returnDate ? new Date(member.returnDate).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            member.status === 'returned' 
                                                                ? 'bg-green-100 text-green-800'
                                                                : member.status === 'issued'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {member.status || 'N/A'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-100 px-6 py-4 border-t text-right">
                            <button
                                onClick={() => setShowMembersModal(false)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Viewbooks