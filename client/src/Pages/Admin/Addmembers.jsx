import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'


const Addmembers = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [role, setRole] = useState('member') // 'member' or 'admin'
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        membershipType: 'standard',
        street: '',
        city: '',
        state: '',
        pincode: ''
    })

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

        if (!fullName || !formData.email || !formData.password) {
            toast.error('First name, last name, email, and password are required')
            return
        }

        if (role === 'member' && formData.phone && !/^\d{10}$/.test(formData.phone)) {
            toast.error('Phone number must be exactly 10 digits')
            return
        }

        setLoading(true)
        try {
            let response;
            const payload = {
                name: fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                membershipType: formData.membershipType,
                street: formData.street,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode
            }

            if (role === 'member') {
                response = await axios.post('/members/register', payload);
            } else {
                // Admin registration
                response = await axios.post('/admin/register', {
                    name: payload.name,
                    email: payload.email,
                    password: payload.password,
                    role: 'admin' // Default role
                });
            }

            if (response.status === 201) {
                toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} added successfully!`)
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    phone: '',
                    membershipType: 'standard',
                    street: '',
                    city: '',
                    state: '',
                    pincode: ''
                })
                setTimeout(() => navigate(role === 'member' ? '/dashboard/members' : '/dashboard'), 1500)
            } else {
                toast.error(response.data.message || `Failed to add ${role}`)
            }
        } catch (error) {
            console.error(`Add ${role} error:`, error)
            toast.error(error.response?.data?.message || 'Internal server error')
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Add New {role.charAt(0).toUpperCase() + role.slice(1)}</h2>

            <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Select Role</label>
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => setRole('member')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition duration-300 ${role === 'member' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Member
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('admin')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition duration-300 ${role === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Admin
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">First Name *</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder={`Enter first name`}
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
                            placeholder={`Enter last name`}
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
                        <label className="block text-gray-700 font-medium mb-2">Password *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {role === 'member' && (
                        <>
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
                        </>
                    )}
                </div>

                {role === 'member' && (
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
                )}

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Adding...' : `Add ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Addmembers
