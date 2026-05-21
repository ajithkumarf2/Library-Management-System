import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import { FiEye, FiArrowUp, FiArrowDown, FiFilter } from 'react-icons/fi'

const Viewmembers = () => {
    const navigate = useNavigate()
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortOrder, setSortOrder] = useState('default') // 'default', 'a-z', 'z-a', 'new-old', 'old-new'
    const [filterType, setFilterType] = useState('all') // 'all', 'premium', 'standard', 'student'
    const [showFilterDropdown, setShowFilterDropdown] = useState(false)
    const [selectedMember, setSelectedMember] = useState(null)
    const [memberBooks, setMemberBooks] = useState([])
    const [showBooksModal, setShowBooksModal] = useState(false)
    const [booksLoading, setBooksLoading] = useState(false)

    useEffect(() => {
        fetchMembers()
    }, [])

    const fetchMembers = async () => {
        try {
            const response = await axios.get('/members/all')
            setMembers(response.data)
        } catch (error) {
            console.error('Fetch members error:', error)
            toast.error('Failed to fetch members')
        } finally {
            setLoading(false)
        }
    }


    const filteredMembers = members.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             member.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterType === 'all' || member.membershipType === filterType
        return matchesSearch && matchesFilter
    })

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this member?')) {
            try {
                const response = await axios.delete(`/members/${id}`)
                if (response.status === 200) {
                    toast.success('Member deleted successfully')
                    fetchMembers()
                }
            } catch (error) {
                console.error('Delete member error:', error)
                toast.error(error.response?.data?.message || 'Failed to delete member')
            }
        }
    }

    const handleViewBooks = async (member) => {
        setSelectedMember(member)
        setShowBooksModal(true)
        setBooksLoading(true)
        try {
            const response = await axios.get(`/issues/member/${member.id}`)
            setMemberBooks(response.data)
        } catch (error) {
            console.error('Fetch member books error:', error)
            toast.error('Failed to fetch member books')
            setMemberBooks([])
        } finally {
            setBooksLoading(false)
        }
    }

    const handleSearchInput = (value) => {
        setSearchTerm(value)
    }

    const membershipTypes = ['all', 'premium', 'standard', 'student']

    const getFilterLabel = () => {
        if (filterType === 'all') return 'All Members'
        return filterType.charAt(0).toUpperCase() + filterType.slice(1)
    }

    const getSortedMembers = () => {
        let sorted = [...filteredMembers]
        
        if (sortOrder === 'a-z') {
            sorted.sort((a, b) => a.name.localeCompare(b.name))
        } else if (sortOrder === 'z-a') {
            sorted.sort((a, b) => b.name.localeCompare(a.name))
        } else if (sortOrder === 'new-old') {
            sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        } else if (sortOrder === 'old-new') {
            sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
        }
        
        return sorted
    }

    if (loading) {
        return <div className="text-center py-8">Loading members...</div>
    }

    const sortedMembers = getSortedMembers()

    return (
        <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">All Members</h2>
                <button
                    onClick={() => navigate('/dashboard/addmembers')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                    Add Member
                </button>
            </div>

            <div className="mb-6 flex gap-3">
                <input
                    type="text"
                    placeholder="Search by name or email..."
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
                        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-48">
                            {membershipTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        setFilterType(type)
                                        setShowFilterDropdown(false)
                                    }}
                                    className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                                        filterType === type 
                                            ? 'bg-blue-100 text-blue-800 font-semibold' 
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    {type === 'all' ? 'All Members' : type.charAt(0).toUpperCase() + type.slice(1)}
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
                            <th className="px-4 py-3 text-left font-semibold">Name</th>
                            <th className="px-4 py-3 text-left font-semibold">Email</th>
                            <th className="px-4 py-3 text-left font-semibold">Phone</th>
                            <th className="px-4 py-3 text-left font-semibold">Membership Type</th>
                            <th className="px-4 py-3 text-left font-semibold">Address</th>
                            <th className="px-4 py-3 text-center font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedMembers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                                    No members found
                                </td>
                            </tr>
                        ) : (
                            sortedMembers.map(member => (
                                <tr key={member.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">{member.name}</td>
                                    <td className="px-4 py-3">{member.email}</td>
                                    <td className="px-4 py-3">{member.phone || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                                            {member.membershipType || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 truncate max-w-xs">
                                        {member.city ? `${member.city}${member.state ? ', ' + member.state : ''}${member.pincode ? ' - ' + member.pincode : ''}` : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleViewBooks(member)}
                                                className="bg-green-500 hover:bg-green-600 text-white 
                                                font-bold py-1 px-3 rounded-lg text-sm flex items-center gap-1"
                                                title="View member's books"
                                            >
                                                <FiEye size={16} />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/dashboard/editmember/${member.id}`)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white 
                                                font-bold py-1 px-3 rounded-lg text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white 
                                                font-bold py-1 px-3 rounded-lg text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Books Modal */}
            {showBooksModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-96 overflow-y-auto">
                        <div className="sticky top-0 bg-gray-200 px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-gray-800">
                                Books issued to {selectedMember?.name}
                            </h3>
                            <button
                                onClick={() => setShowBooksModal(false)}
                                className="text-gray-600 hover:text-gray-900 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="p-6">
                            {booksLoading ? (
                                <div className="text-center py-8">Loading books...</div>
                            ) : memberBooks.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No books issued to this member
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold">Book Title</th>
                                                <th className="px-4 py-3 text-left font-semibold">Author</th>
                                                <th className="px-4 py-3 text-left font-semibold">Issue Date</th>
                                                <th className="px-4 py-3 text-left font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {memberBooks.map((book, index) => (
                                                <tr key={index} className="border-b hover:bg-gray-50">
                                                    <td className="px-4 py-3">{book.bookTitle || 'N/A'}</td>
                                                    <td className="px-4 py-3">{book.author || 'N/A'}</td>
                                                    <td className="px-4 py-3">
                                                        {book.issueDate ? new Date(book.issueDate).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            book.status === 'returned' 
                                                                ? 'bg-green-100 text-green-800'
                                                                : book.status === 'issued'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {book.status || 'N/A'}
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
                                onClick={() => setShowBooksModal(false)}
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

export default Viewmembers
