import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UserDashboard() {
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: '',
  });

  const fetchLogs = async (page = 1, filters = {}) => {
    try {
      const token = localStorage.getItem('authToken');
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
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage, filters);
  }, [currentPage, filters]);

  return (
    <div>
      <h2>User Logs Dashboard</h2>
      {/* Filtering UI */}
      <div>
        <input
          type="text"
          placeholder="Filter by action"
          value={filters.action}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, action: e.target.value }))
          }
        />
        <input
          type="date"
          placeholder="Start Date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, startDate: e.target.value }))
          }
        />
        <input
          type="date"
          placeholder="End Date"
          value={filters.endDate}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, endDate: e.target.value }))
          }
        />
        <button onClick={() => fetchLogs(1, filters)}>Apply Filters</button>
      </div>

      {/* Display Logs */}
      <ul>
        {logs.map((log) => (
          <li key={log._id}>
            <strong>{log.action}</strong> at{' '}
            {new Date(log.timestamp).toLocaleString()} from IP: {log.ipAddress}
          </li>
        ))}
      </ul>

      {/* Pagination Controls */}
      <div>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default UserDashboard;
