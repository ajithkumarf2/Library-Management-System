import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'

const Editbook = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        category: '',
        quantity: '',
        description: '',
        shelfLocation: '',
        document: ''
    })

    const [file, setFile] = useState(null)

    useEffect(() => {
        fetchBook()
    }, [id])

    const fetchBook = async () => {
        try {
            const response = await axios.get(`/books/${id}`)
            const book = response.data
            setFormData({
                title: book.title || '',
                author: book.author || '',
                isbn: book.isbn || '',
                category: book.category || '',
                quantity: book.quantity || '',
                description: book.description || '',
                shelfLocation: book.shelfLocation || '',
                document: book.document || ''
            })
        } catch (error) {
            console.error('Fetch book error:', error)
            toast.error('Failed to fetch book details')
            navigate('/dashboard/viewbooks')
        } finally {
            setFetching(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.title || !formData.author || !formData.quantity) {
            toast.error('Title, author, and quantity are required')
            return
        }

        setLoading(true)
        try {
            const data = new FormData()
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key])
            })
            if (file) {
                data.append('document', file)
            }

            const response = await axios.put(`/books/update/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (response.status === 200) {
                toast.success('Book updated successfully!')
                setTimeout(() => navigate('/dashboard/viewbooks'), 1500)
            }
        } catch (error) {
            console.error('Update book error:', error)
            toast.error(error.response?.data?.message || 'Failed to update book')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return <div className="text-center py-20">Loading book details...</div>
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Edit Book</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Book Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter book title"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Author *</label>
                        <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            placeholder="Enter author name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">ISBN</label>
                        <input
                            type="text"
                            name="isbn"
                            value={formData.isbn}
                            onChange={handleChange}
                            placeholder="Enter ISBN"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Category</label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="Enter category"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Quantity *</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            placeholder="Enter quantity"
                            min="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Shelf Location</label>
                        <input
                            type="text"
                            name="shelfLocation"
                            value={formData.shelfLocation}
                            onChange={handleChange}
                            placeholder="Enter shelf location"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Update Document (PDF only)</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formData.document && (
                            <p className="text-xs text-blue-600 mt-1">Current: {formData.document.split('\\').pop()}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter book description"
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Update Book'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/viewbooks')}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Editbook
