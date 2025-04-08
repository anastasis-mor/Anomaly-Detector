import React from 'react';
import { Link } from 'react-router-dom';
import { decodeToken } from './utils/decodedToken';

function TopNavbar({ isLoggedIn }) {
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  let isAdmin = false;

  if (isLoggedIn) {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Decode the token
      const decodedToken = decodeToken(token);
      if (decodedToken && decodedToken.role === 'admin') {
        isAdmin = true;
      }
    }
  }

  return (
    <div
      style={{
        background: '#ccc',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
      }}
    >
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Agent+</div>

      <div>
        {isLoggedIn ? (
          <>
            {isAdmin && (
              <Link to="/admin" style={{ marginRight: '1rem' }}>
                Admin Dashboard
              </Link>
            )}
            <Link to="/user-dashboard" style={{ marginRight: '1rem' }}>
              User Dashboard
            </Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: '1rem' }}>
              Login
            </Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default TopNavbar;
