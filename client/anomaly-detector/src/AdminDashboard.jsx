import React, { useEffect, useState } from 'react'
import axios from 'axios'

function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [logs, setLogs] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    // On mount, check if the user is admin & fetch data
    fetchAllUsers()
    fetchLogs()
  }, [])

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('No token found. Please log in.')
        return
      }
      const response = await axios.get('http://localhost:8080/user/all-users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setUsers(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users')
    }
  }

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('No token found. Please log in.')
        return
      }
      const response = await axios.get('http://localhost:8080/user/logs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setLogs(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch logs')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    // optionally navigate back to login page
    window.location.href = '/'
  }

  if (error) {
    return <div><h2>Admin Dashboard</h2><p style={{color:'red'}}>{error}</p></div>
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>

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
        <ul>
          {logs.map(log => (
            <li key={log._id}>
              <strong>{log.action}</strong> by userId: {log.userId} at {log.timestamp}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default AdminDashboard
