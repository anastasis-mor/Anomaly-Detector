import React from 'react'
import { Link } from 'react-router-dom'

function Sidebar() {
  return (
    <div style={{ padding: '1rem' }}>
      <h3>Links</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link to="/anomaly">Live Anomaly Alert</Link></li>
        <li><Link to="/logs">User Activity Log</Link></li>
      </ul>
    </div>
  )
}

export default Sidebar
