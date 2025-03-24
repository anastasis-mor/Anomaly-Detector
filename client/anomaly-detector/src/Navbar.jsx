import React from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav style={{ marginBottom: '1rem' }}>
      <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
      <Link to="/register" style={{ marginRight: '1rem' }}>Register</Link>
      <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
      <Link to="/profile" style={{ marginRight: '1rem' }}>Profile</Link>
      <Link to="/test" style={{ marginRight: '1rem' }}>TestGetUser</Link>
      <Link to="/admin" style={{ marginRight: '1rem' }}>Admin Dashboard</Link>
    </nav>
  )
}

export default Navbar
