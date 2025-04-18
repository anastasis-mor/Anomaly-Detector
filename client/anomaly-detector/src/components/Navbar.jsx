import React from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav style={{ background: '#ddd', padding: '1rem' }}>
      <Link to="/">Home</Link>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
      <Link to="/user-dashboard">Dashboard</Link>
    </nav>
  )
}

export default Navbar
