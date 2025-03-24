import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './Navbar'
import Register from './Register'
import Login from './Login'
import UserProfile from './UserProfile'
import TestGetUser from './TestGetUser'
import AdminDashboard from './AdminDashboard'

function App() {
  return (
    <div>
      <h1>Agent+ Security App</h1>
      
      {/* Render the Navbar on every page */}
      <Navbar />

      {/* Define your routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/test" element={<TestGetUser />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

function HomePage() {
  return <div>Welcome to the Agent+ Security App</div>
}

function NotFound() {
  return <div>404 - Not Found</div>
}

export default App
