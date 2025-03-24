import React from 'react'
import { Link } from 'react-router-dom'

function TopNavbar({ isLoggedIn }) {
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    window.location.href = '/login'
  }

  return (
    <div
      style={{
        background: '#ccc',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem'
      }}
    >
      {/* Left side: "Agent+" */}
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
        Agent+
      </div>

      {/* Right side: depends on login status */}
      <div>
        {isLoggedIn ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  )
}

export default TopNavbar
