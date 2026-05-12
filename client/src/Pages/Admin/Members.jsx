import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'

const Viewmembers = () => {
    const navigate = useNavigate()
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

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


    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

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

    if (loading) {
        return <div className="text-center py-8">Loading members...</div>
    }

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

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                        {filteredMembers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                                    No members found
                                </td>
                            </tr>
                        ) : (
                            filteredMembers.map(member => (
                                <tr key={member.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">{member.name}</td>
                                    <td className="px-4 py-3">{member.email}</td>
                                    <td className="px-4 py-3">{member.phone || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                                            {member.membershipType || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 truncate max-w-xs">{member.address || '-'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
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
        </div>
    )
}

export default Viewmembers