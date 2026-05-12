import React, { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './Components/Login'
import Dashboard from './Pages/Admin/Dashboard'
import Addmembers from './Pages/Admin/Addmembers'
import Members from './Pages/Admin/Members'
import Addbooks from './Pages/Admin/Addbooks'
import Viewbooks from './Pages/Admin/Viewbooks'
import Issuedbook from './Pages/Admin/Issuedbook'
import Returnedbook from './Pages/Admin/Returnedbook'
import Bookhistory from './Pages/Admin/Bookhistory'
import Studyroom from './Pages/Admin/Studyroom'
import Signout from './Pages/Admin/Signout'
import Editmember from './Pages/Admin/Editmember'
import MemberDashboard from './Pages/Member/Dashboard'
import MemberLayout from './Pages/Member/MemberLayout'
import BrowseBooks from './Pages/Member/BrowseBooks'
import AIRecommendations from './Pages/Member/AIRecommendations'
import Wishlist from './Pages/Member/Wishlist'
import Analytics from './Pages/Member/Analytics'
import IssuedBooks from './Pages/Member/IssuedBooks'
import ReturnedBooks from './Pages/Member/ReturnedBooks'

const PrivateRoute = ({ children }) => {
    const isAdmin = localStorage.getItem('libraAdminToken');
    return isAdmin ? children : <Navigate to="/login" />;
};

const MemberPrivateRoute = ({ children }) => {
    const isUser = localStorage.getItem('libraUserToken');
    return isUser ? children : (
        <Navigate to="/login" />
    );
};

const App = () => {
  const isAdmin = localStorage.getItem('libraAdminToken');
  const isUser = localStorage.getItem('libraUserToken');

  return (
    <div>
      <Toaster position='top-center' toastOptions={{duration: 2000}}/>
      <Routes>
        <Route 
          path='/' 
          element={
            isAdmin ? <Navigate to="/dashboard" /> : 
            isUser ? <Navigate to="/user/dashboard" /> : 
            <Login />
          } 
        />
        <Route path='/login' element={<Login />} />
        
        {/* Admin Routes */}
        <Route 
          path='/dashboard' 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route path='addmembers' element={<Addmembers />} />
          <Route path='members' element={<Members />} />
          <Route path='editmember/:id' element={<Editmember />} />
          <Route path='addbooks' element={<Addbooks />} />
          <Route path='viewbooks' element={<Viewbooks />} />
          <Route path='issuedbooks' element={<Issuedbook />} />
          <Route path='returnedbooks' element={<Returnedbook />} />
          <Route path='bookhistory' element={<Bookhistory />} />
          <Route path='studyroom' element={<Studyroom />} />
          <Route path='signout' element={<Signout />} />
        </Route>

        {/* Member Routes */}
        <Route 
          path='/user/*' 
          element={
            <MemberPrivateRoute>
              <MemberLayout>
                <Routes>
                  <Route path='dashboard' element={<MemberDashboard />} />
                  <Route path='browse' element={<BrowseBooks />} />
                  <Route path='ai-recs' element={<AIRecommendations />} />
                  <Route path='wishlist' element={<Wishlist />} />
                  <Route path='analytics' element={<Analytics />} />
                  <Route path='issued' element={<IssuedBooks />} />
                  <Route path='returned' element={<ReturnedBooks />} />
                  <Route path='*' element={<Navigate to="dashboard" />} />
                </Routes>
              </MemberLayout>
            </MemberPrivateRoute>
          } 
        />
      </Routes>
    </div>
  )
}

export default App