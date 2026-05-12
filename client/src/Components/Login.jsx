import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    React.useEffect(() => {
        const isAdmin = localStorage.getItem('libraAdminToken');
        const isUser = localStorage.getItem('libraUserToken');
        if (isAdmin) navigate('/dashboard');
        else if (isUser) navigate('/user/dashboard');
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault()

        if (!email || !password) {
            toast.error('Please fill in all fields')
            return
        }

        setLoading(true)
        try {
            // First attempt Admin login
            try {
                const adminResponse = await axios.post('/admin/login', { email, password })
                localStorage.setItem('libraAdminToken', adminResponse.data.token)
                localStorage.setItem('libraAdminUser', JSON.stringify(adminResponse.data.admin))
                toast.success('Admin Login successful!')
                navigate('/dashboard')
                return // Exit if admin login is successful
            } catch (adminError) {
                // If admin login fails, attempt Member login
                if (adminError.response?.status === 401 || adminError.response?.status === 404) {
                    const memberResponse = await axios.post('/members/login', { email, password })
                    localStorage.setItem('libraUserToken', memberResponse.data.token)
                    localStorage.setItem('libraUserData', JSON.stringify(memberResponse.data.member))
                    toast.success('Member Login successful!')
                    navigate('/user/dashboard')
                    return
                }
                throw adminError // If it's a different error (e.g. 500), throw it to the outer catch
            }
        } catch (error) {
            console.error('Login error:', error)
            toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Library Management</h1>
                <p className="text-gray-600 text-center mb-8">Login to your account</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="text-center text-gray-600 text-sm mt-6">
                    Test Credentials:<br />
                    Email: admin@library.com<br />
                    Password: admin123
                </p>
            </div>
        </div>
    )
}

export default Login