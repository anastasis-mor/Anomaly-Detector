import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  
  // Pagination & filtering state for logs
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchAllUsers();
    fetchLogs(currentPage, filters);
  }, [currentPage, filters]);

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No token found. Please log in.');
        return;
      }
      const response = await axios.get('http://localhost:8080/user/all-users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    }
  };

  const fetchLogs = async (page = 1, filters = {}) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No token found. Please log in.');
        return;
      }
      const response = await axios.get(
        `http://localhost:8080/api/logs?page=${page}&limit=20` +
          `&action=${filters.action || ''}` +
          `&startDate=${filters.startDate || ''}` +
          `&endDate=${filters.endDate || ''}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLogs(response.data.logs);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch logs');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <div>
      <section>
        <h3>All Users</h3>
        <ul>
          {users.map(u => (
            <li key={u._id}>
              {u.name} - {u.email} ({u.role})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Logs</h3>
        {/* Filtering UI */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Filter by action"
            value={filters.action}
            onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
            style={{ marginRight: '0.5rem' }}
          />
          <input
            type="date"
            placeholder="Start Date"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            style={{ marginRight: '0.5rem' }}
          />
          <input
            type="date"
            placeholder="End Date"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            style={{ marginRight: '0.5rem' }}
          />
          <button onClick={() => fetchLogs(1, filters)}>Apply Filters</button>
        </div>

        {/* Logs List */}
        <ul>
          {logs.map(log => (
            <li key={log._id}>
              <strong>{log.action}</strong> by userId: {log.userId} at{' '}
              {new Date(log.timestamp).toLocaleString()} from IP: {log.ipAddress}
            </li>
          ))}
        </ul>

        {/* Pagination Controls */}
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span style={{ margin: '0 1rem' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </section>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default AdminDashboard;
