import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';

const AlertSidebar = () => {
  const [alertStats, setAlertStats] = useState({
    counts: {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0
    },
    total: 0,
    mostRecent: null
  });
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Fetch initial stats
    fetchAlertStats();

    // Initialize socket connection
    const siteId = localStorage.getItem('siteId') || '67f438c6307f75fd26a4f160'; // Default or from storage
    const socketInstance = io('http://localhost:8080', {
      query: { siteId }
    });
    
    setSocket(socketInstance);

    // Listen for new alerts
    socketInstance.on('alert', (data) => {
      // Update the counts and mostRecent
      setAlertStats(prev => {
        const newCounts = {...prev.counts};
        if (data.severity) {
          newCounts[data.severity] = (newCounts[data.severity] || 0) + 1;
        }
        
        return {
          counts: newCounts,
          total: prev.total + 1,
          mostRecent: data
        };
      });

      // Play notification sound for High and Critical alerts
      if (data.severity === 'High' || data.severity === 'Critical') {
        playAlertSound();
      }
    });

    // Listen for resolved alerts
    socketInstance.on('alert_resolved', (data) => {
      setAlertStats(prev => {
        const newCounts = {...prev.counts};
        if (data.severity) {
          newCounts[data.severity] = Math.max(0, (newCounts[data.severity] || 0) - 1);
        }
        
        return {
          counts: newCounts,
          total: Math.max(0, prev.total - 1),
          mostRecent: prev.mostRecent
        };
      });
    });

    // Listen for cleared alerts
    socketInstance.on('alerts_cleared', (data) => {
      // Refresh stats after alerts are cleared
      fetchAlertStats();
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const fetchAlertStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/api/alerts/recent', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlertStats(data);
      } else {
        console.error('Failed to fetch alert stats');
      }
    } catch (error) {
      console.error('Error fetching alert stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const playAlertSound = () => {
    const audio = new Audio('/alert-sound.mp3');
    audio.play().catch(e => console.log('Failed to play alert sound:', e));
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return '#d00';
      case 'high': return '#f44';
      case 'medium': return '#fa0';
      case 'low': return '#0c0';
      default: return '#aaa';
    }
  };

  // If no alerts, show minimal view
  if (!loading && alertStats.total === 0) {
    return (
      <div className="alert-sidebar" style={{ 
        padding: '0.75rem',
        marginBottom: '1rem',
        borderRadius: '4px',
        border: '1px solid #eee',
        background: '#f9f9f9'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Security Status</h4>
        <div style={{ color: 'green', fontWeight: 'bold', fontSize: '0.9rem' }}>
          All systems normal
        </div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
          <Link to="/anomaly" style={{ textDecoration: 'none', color: '#555' }}>
            View Monitoring Dashboard →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="alert-sidebar" style={{ 
      padding: '0.75rem',
      marginBottom: '1rem', 
      borderRadius: '4px',
      border: alertStats.counts.Critical > 0 ? '1px solid #d00' : '1px solid #eee',
      background: alertStats.counts.Critical > 0 ? '#fee' : '#f9f9f9'
    }}>
      <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>
          Active Alerts
          {alertStats.total > 0 && (
            <span style={{ 
              marginLeft: '0.5rem', 
              background: '#555', 
              color: 'white',
              padding: '0.15rem 0.4rem',
              borderRadius: '10px',
              fontSize: '0.7rem'
            }}>
              {alertStats.total}
            </span>
          )}
        </span>
        {loading && <small style={{ fontSize: '0.8rem', color: '#888' }}>Loading...</small>}
      </h4>

      {/* Alert stats by severity */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {Object.entries(alertStats.counts).map(([severity, count]) => (
          count > 0 && (
            <div key={severity} style={{ 
              padding: '0.2rem 0.5rem',
              background: getSeverityColor(severity) + '22', // Add transparency
              border: `1px solid ${getSeverityColor(severity)}`,
              borderRadius: '4px',
              fontSize: '0.75rem'
            }}>
              <span style={{ fontWeight: 'bold', color: getSeverityColor(severity) }}>{severity}</span>
              <span style={{ marginLeft: '0.25rem' }}>{count}</span>
            </div>
          )
        ))}
      </div>

      {/* Most recent alert */}
      {alertStats.mostRecent && (
        <div style={{ 
          padding: '0.5rem',
          background: '#fff',
          border: `1px solid ${getSeverityColor(alertStats.mostRecent.severity)}`,
          borderLeft: `4px solid ${getSeverityColor(alertStats.mostRecent.severity)}`,
          borderRadius: '4px',
          fontSize: '0.8rem',
          marginBottom: '0.5rem'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
            {alertStats.mostRecent.message}
          </div>
          <div style={{ color: '#666', fontSize: '0.75rem' }}>
            {new Date(alertStats.mostRecent.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
        <Link to="/anomaly" style={{ textDecoration: 'none', color: '#555' }}>
          View All Alerts →
        </Link>
      </div>
    </div>
  );
};

export default AlertSidebar;