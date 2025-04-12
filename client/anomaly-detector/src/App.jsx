import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Home from './Home'
import Login from './Login'
import Register from './Register'
import AdminDashboard from './AdminDashboard'
import UserDashboard from './UserDashboard';
import UserActivityChart from './UserActivityChart'
import AnomalyDetection from '../src/components/AnomalyDetection';


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
        <Route path="/anomaly" element={<AnomalyDetection />} />
      </Route>
    </Routes>
  )
}

export default App
