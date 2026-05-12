import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'

const Signout = () => {
    const navigate = useNavigate()

    useEffect(() => {
        handleSignout()
    }, [])

    const handleSignout = async () => {
        try {
            await axios.get('/admin/logout')
            localStorage.removeItem('libraAdminToken')
            localStorage.removeItem('libraAdminUser')
            toast.success('Logged out successfully!')
            setTimeout(() => navigate('/login'), 1000)
        } catch (error) {
            console.error('Logout error:', error)
            localStorage.removeItem('libraAdminToken')
            localStorage.removeItem('libraAdminUser')
            navigate('/login')
        }
    }


    return (
        <div className="text-center py-8">
            <p>Logging out...</p>
        </div>
    )
}

export default Signout