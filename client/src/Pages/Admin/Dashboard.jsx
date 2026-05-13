import React, { useEffect, useState } from 'react'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import { Users, Plus, BookOpen, BookMarked, BookCheck, History, BookMarked as BookMarked2, LogOut, Users2 } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const Dashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isOnDashboard = location.pathname === '/dashboard'
  const [admin, setAdmin] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = sessionStorage.getItem('libraAdminToken')
    const adminUser = sessionStorage.getItem('libraAdminUser')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      setAdmin(JSON.parse(adminUser))
      const response = await axios.get('/admin/dashboard')
      setStats(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Auth check error:', error)
      sessionStorage.removeItem('libraAdminToken')
      sessionStorage.removeItem('libraAdminUser')
      navigate('/login')
    }
  }


  const cards = [
    { title: 'Members', icon: Users2, color: 'bg-green-400', path: '/dashboard/members' },
    { title: 'View Books', icon: BookOpen, color: 'bg-orange-400', path: '/dashboard/viewbooks' },
    { title: 'Issued Books', icon: BookMarked, color: 'bg-red-400', path: '/dashboard/issuedbooks' },
    { title: 'Returned Books', icon: BookCheck, color: 'bg-gray-400', path: '/dashboard/returnedbooks' },
    { title: 'Book History', icon: History, color: 'bg-green-700', path: '/dashboard/bookhistory' },
    { title: 'Study Room', icon: BookMarked2, color: 'bg-lime-500', path: '/dashboard/studyroom' },
  ]

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Navbar */}
        <div className='bg-white shadow-lg rounded-lg p-4 mb-8'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>Library Management System</h1>
              <p className='text-gray-600 text-sm'>Welcome, {admin?.name || 'Admin'}</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/signout')}
              className='bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2'
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {isOnDashboard && stats && (
          <>
            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
              <div className='bg-white rounded-lg shadow-lg p-6'>
                <p className='text-gray-600 text-sm'>Total Members</p>
                <p className='text-3xl font-bold text-blue-600'>{stats.totalMembers || 0}</p>
              </div>
              <div className='bg-white rounded-lg shadow-lg p-6'>
                <p className='text-gray-600 text-sm'>Total Books</p>
                <p className='text-3xl font-bold text-green-600'>{stats.totalBooks || 0}</p>
              </div>
              <div className='bg-white rounded-lg shadow-lg p-6'>
                <p className='text-gray-600 text-sm'>Issued Books</p>
                <p className='text-3xl font-bold text-orange-600'>{stats.issuedBooks || 0}</p>
              </div>
              <div className='bg-white rounded-lg shadow-lg p-6'>
                <p className='text-gray-600 text-sm'>Overdue Books</p>
                <p className='text-3xl font-bold text-red-600'>{stats.overdueBooks || 0}</p>
              </div>
            </div>

            <h2 className='text-3xl font-bold text-gray-800 mb-8 text-center'>Quick Actions</h2>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {cards.map((card, index) => {
                const Icon = card.icon
                return (
                  <div
                    key={index}
                    onClick={() => navigate(card.path)}
                    className={`${card.color} text-white p-8 rounded-2xl shadow-lg hover:shadow-2xl 
                    hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center 
                    justify-center min-h-40 group`}
                  >
                    <Icon size={48} className='mb-4 group-hover:scale-110 transition-transform' />
                    <h2 className='text-xl font-bold text-center'>{card.title}</h2>
                  </div>
                )
              })}
            </div>
          </>
        )}
        <Outlet />
      </div>
    </div>
  )
}



export default Dashboard