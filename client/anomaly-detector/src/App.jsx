import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Home from './Home'
import Login from './Login'
import Register from './Register'
import AdminDashboard from './AdminDashboard'
import UserDashboard from './UserDashboard';
import UserActivityChart from './UserActivityChart';


function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/logs" element={<UserActivityChart />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
      </Route>
    </Routes>
  )
}

export default App
