import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import Sidebar from '../components/Sidebar';

function AppLayout() {
  const location = useLocation(); // triggers re-render on route changes
  const token = localStorage.getItem('authToken');
  const isLoggedIn = !!token;

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNavbar isLoggedIn={isLoggedIn} />
      <div style={{ flex: 1, display: 'flex' }}>
        {isLoggedIn && (
          <div style={{ width: '200px', background: '#eee' }}>
            <Sidebar />
          </div>
        )}
        <div style={{ flex: 1, padding: '1rem' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
