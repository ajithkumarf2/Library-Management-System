import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'

const Editmember = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        membershipType: 'standard',
        street: '',
        city: '',
        state: '',
        pincode: ''
    })

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const response = await axios.get(`/members/${id}`)
                
                const fullName = response.data.name || ''
                const firstSpaceIndex = fullName.indexOf(' ')
                let firstName = fullName
                let lastName = ''
                if (firstSpaceIndex !== -1) {
                    firstName = fullName.substring(0, firstSpaceIndex)
                    lastName = fullName.substring(firstSpaceIndex + 1)
                }

                setFormData({
                    firstName: firstName,
                    lastName: lastName,
                    email: response.data.email || '',
                    phone: response.data.phone || '',
                    membershipType: response.data.membershipType || 'standard',
                    street: response.data.street || '',
                    city: response.data.city || '',
                    state: response.data.state || '',
                    pincode: response.data.pincode || ''
                })
            } catch (error) {
                console.error('Fetch member error:', error)
                toast.error('Failed to fetch member details')
                navigate('/dashboard/members')
            } finally {
                setFetching(false)
            }
        }
        fetchMember()
    }, [id, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const fullName = `${formData.firstName} ${formData.lastName}`.trim()

        if (!fullName || !formData.email) {
            toast.error('First name, last name, and email are required')
            return
        }

        if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
            toast.error('Phone number must be exactly 10 digits')
            return
        }

        setLoading(true)
        try {
            const payload = {
                name: fullName,
                email: formData.email,
                phone: formData.phone,
                membershipType: formData.membershipType,
                street: formData.street,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode
            }
            const response = await axios.put(`/members/${id}`, payload);

            if (response.status === 200) {
                toast.success('Member updated successfully!')
                setTimeout(() => navigate('/dashboard/members'), 1500)
            } else {
                toast.error(response.data.message || 'Failed to update member')
            }
        } catch (error) {
            console.error('Update member error:', error)
            toast.error(error.response?.data?.message || 'Internal server error')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return <div className="text-center py-8">Loading member details...</div>
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Edit Member</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">First Name *</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Enter first name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Last Name *</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Enter last name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            maxLength={10}
                            placeholder="Enter phone number"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Membership Type</label>
                        <select
                            name="membershipType"
                            value={formData.membershipType}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                            <option value="student">Student</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-2">Address</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="street"
                            value={formData.street}
                            onChange={handleChange}
                            placeholder="Street Address"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="State"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            placeholder="Pincode"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Update Member'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/members')}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Editmember
