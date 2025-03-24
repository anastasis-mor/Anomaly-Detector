import React from 'react'

function DashboardNavbar() {
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    window.location.href = '/login' // redirect to login
  }

  return (
    <div style={{ background: '#ccc', padding: '1rem' }}>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default DashboardNavbar
