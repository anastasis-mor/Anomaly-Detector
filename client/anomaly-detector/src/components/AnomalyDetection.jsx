import React, { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';

const AnomalyDetection = () => {
  const [alerts, setAlerts] = useState([]);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterTimeRange, setFilterTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 100,
    offset: 0
  });

  // Fetch alerts from the API with filters
  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // Build query params
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterSeverity !== 'all') params.append('severity', filterSeverity);
      if (filterTimeRange !== 'all') params.append('timeRange', filterTimeRange);
      params.append('limit', pagination.limit);
      params.append('offset', pagination.offset);
      
      const response = await fetch(`http://localhost:8080/api/alerts?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.data.map(alert => ({
          ...alert,
          timestamp: new Date(alert.timestamp)
        })));
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch alerts');
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterSeverity, filterTimeRange, pagination.limit, pagination.offset]);

  useEffect(() => {
    // Initial fetch of alerts
    fetchAlerts();
    
    // Initialize socket connection
    const connectToSocket = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No auth token found');
          return;
        }
        
        // Try to get the site ID from localStorage first
        let siteId = localStorage.getItem('userSiteId');
        
        // If not found in localStorage, fetch from API
        if (!siteId) {
          try {
            const response = await fetch('http://localhost:8080/user/me/site', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              siteId = data.siteId;
              // Store for future use
              localStorage.setItem('userSiteId', siteId);
            } else {
              console.error('Failed to fetch site ID');
            }
          } catch (error) {
            console.error('Error fetching site ID:', error);
          }
        }
        
        console.log('Connecting socket with site ID:', siteId);
        
        // Connect with the site ID
        const socketInstance = io('http://localhost:8080', {
          query: { siteId }
        });
    
    setSocket(socketInstance);

    // Set up event listeners
    socketInstance.on('connect', () => {
      console.log('Connected to socket with ID:', socketInstance.id);
      setConnected(true);
    });

    // Rest of your socket event handlers remain the same
    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setConnected(false);
    });

    socketInstance.on('alert', (data) => {
      console.log('Received alert:', data);
      // Add audio notification for critical alerts
      if (data.severity === 'Critical') {
        playAlertSound();
      }
      
      // Only add to the displayed alerts if it matches current filters
      if (
        (filterType === 'all' || data.type === filterType) &&
        (filterSeverity === 'all' || data.severity === filterSeverity)
      ) {
        setAlerts(prevAlerts => {
          // Check if alert with this ID already exists
          const exists = prevAlerts.some(alert => alert._id === data._id);
          if (exists) {
            return prevAlerts; // Don't add duplicates
          }
          return [
            {
              ...data, 
              timestamp: new Date(data.timestamp || Date.now())
            }, 
            ...prevAlerts
          ];
        });
      }
    });
    // Listen for resolved alerts
    socketInstance.on('alert_resolved', (data) => {
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert._id === data._id 
            ? { ...alert, status: 'resolved', resolvedAt: new Date(data.resolvedAt) } 
            : alert
        )
      );
    });

    // Listen for cleared alerts
    socketInstance.on('alerts_cleared', () => {
      fetchAlerts();
    });
  } catch (error) {
    // Add this catch block to fix the error
    console.error('Error setting up socket connection:', error);
  }
};

  connectToSocket();
    
  // Cleanup function
  return () => {
    if (socket) {
      socket.disconnect();
    }
  };
  }, [fetchAlerts, filterType, filterSeverity]);
  useEffect(() => {
    if (pagination.offset >= 0) {
      fetchAlerts();
    }
  }, [pagination.offset, pagination.limit, fetchAlerts]);

  // Mark an alert as resolved
  const handleResolveAlert = async (alertId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/alerts/${alertId}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const resolvedAlert = await response.json();
        setAlerts(prevAlerts => 
          prevAlerts.map(alert => 
            alert._id === alertId 
              ? { ...alert, status: 'resolved', resolvedAt: new Date(resolvedAlert.resolvedAt) } 
              : alert
          )
        );
      } else {
        console.error('Failed to resolve alert');
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  // Clear all visible alerts
  const handleClearAllAlerts = async () => {
    try {
      // Build query params based on current filters
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterSeverity !== 'all') params.append('severity', filterSeverity);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/alerts/clear?${params.toString()}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Refresh alerts list
        fetchAlerts();
      } else {
        console.error('Failed to clear alerts');
      }
    } catch (error) {
      console.error('Error clearing alerts:', error);
    }
  };

  // Play sound for critical alerts
  const playAlertSound = () => {
    const audio = new Audio('/alert-sound.mp3'); // Add this file to your public directory
    audio.play().catch(e => console.log('Failed to play alert sound:', e));
  };

  return (
    <div className="anomaly-detection-container" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Security Alert Dashboard</h2>
        
        <div className="connection-status">
          Status: {connected ? (
            <span style={{ color: 'green', fontWeight: 'bold' }}>Connected</span>
          ) : (
            <span style={{ color: 'red', fontWeight: 'bold' }}>Disconnected</span>
          )}
        </div>
      </div>
      
      <div className="filters" style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '1rem',
        background: '#f5f5f5',
        padding: '1rem',
        borderRadius: '4px'
      }}>
        <div>
          <label htmlFor="type-filter">Alert Type: </label>
          <select 
            id="type-filter" 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '0.3rem' }}
          >
            <option value="all">All Types</option>
            <option value="failed_login">Failed Login</option>
            <option value="brute_force">Brute Force</option>
            <option value="suspicious_ip">Suspicious IP</option>
            <option value="api_abuse">API Abuse</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="severity-filter">Severity: </label>
          <select 
            id="severity-filter" 
            value={filterSeverity} 
            onChange={(e) => setFilterSeverity(e.target.value)}
            style={{ padding: '0.3rem' }}
          >
            <option value="all">All Severities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="time-filter">Time Range: </label>
          <select 
            id="time-filter" 
            value={filterTimeRange} 
            onChange={(e) => setFilterTimeRange(e.target.value)}
            style={{ padding: '0.3rem' }}
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
        
        <button 
          onClick={fetchAlerts}
          style={{ 
            padding: '0.3rem 0.8rem', 
            background: '#f0f0f0', 
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: 'auto'
          }}
        >
          Refresh
        </button>
      </div>

      <div className="alerts-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3>Security Alerts {alerts.length > 0 && `(${alerts.length})`}</h3>
          
          {alerts.length > 0 && (
            <button 
              onClick={handleClearAllAlerts} 
              style={{ 
                padding: '0.3rem 0.8rem', 
                background: '#f0f0f0', 
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear All Visible Alerts
            </button>
          )}
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            background: '#f9f9f9',
            borderRadius: '4px',
            border: '1px solid #eee'
          }}>
            <p style={{ color: '#666' }}>No anomalies detected within the selected filters.</p>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>The system is monitoring for suspicious activities.</p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {alerts.map(alert => (
              <li key={alert._id} style={{ 
                background: getSeverityColor(alert.severity), 
                padding: '1rem', 
                marginBottom: '0.5rem',
                borderRadius: '4px',
                borderLeft: `5px solid ${getSeverityBorderColor(alert.severity)}`,
                position: 'relative',
                opacity: alert.status === 'resolved' ? 0.7 : 1
              }}>
                {alert.status === 'resolved' && (
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: '#555',
                    color: 'white',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '3px',
                    fontSize: '0.7rem'
                  }}>
                    Resolved
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{alert.message}</span>
                  <span style={{ 
                    background: getSeverityBadgeColor(alert.severity),
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    color: 'white'
                  }}>
                    {alert.severity}
                  </span>
                </div>
                
                {alert.details && (
                  <div style={{ margin: '0.5rem 0' }}>{alert.details}</div>
                )}
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: '0.5rem', 
                  fontSize: '0.9rem', 
                  color: '#666' 
                }}>
                  <div>
                    <span style={{ marginRight: '1rem' }}><strong>Type:</strong> {formatAlertType(alert.type)}</span>
                    {alert.sourceIP && (
                      <span style={{ marginRight: '1rem' }}><strong>Source IP:</strong> {alert.sourceIP}</span>
                    )}
                    {alert.targetUser && (
                      <span><strong>Target:</strong> {alert.targetUser}</span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span><strong>Time:</strong> {alert.timestamp.toLocaleString()}</span>
                    
                    {alert.status !== 'resolved' && (
                      <button 
                        onClick={() => handleResolveAlert(alert._id)}
                        style={{ 
                          padding: '0.2rem 0.5rem', 
                          background: '#f0f0f0', 
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        {/* Pagination controls */}
        {pagination.total > pagination.limit && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '0.5rem', 
            marginTop: '1rem', 
            padding: '0.5rem',
            background: '#f5f5f5',
            borderRadius: '4px'
          }}>
            <button 
              disabled={pagination.offset === 0}
              onClick={() => {
                setPagination(prev => ({
                  ...prev,
                  offset: Math.max(0, prev.offset - prev.limit)
                }));
              }}
              style={{ 
                padding: '0.3rem 0.8rem', 
                cursor: pagination.offset === 0 ? 'not-allowed' : 'pointer',
                opacity: pagination.offset === 0 ? 0.6 : 1
              }}
            >
              Previous
            </button>
            
            <span style={{ padding: '0.3rem 0.5rem' }}>
              {Math.floor(pagination.offset / pagination.limit) + 1} of {Math.ceil(pagination.total / pagination.limit)}
            </span>
            
            <button 
              disabled={pagination.offset + pagination.limit >= pagination.total}
              onClick={() => {
                setPagination(prev => ({
                  ...prev,
                  offset: prev.offset + prev.limit
                }));
              }}
              style={{ 
                padding: '0.3rem 0.8rem', 
                cursor: pagination.offset + pagination.limit >= pagination.total ? 'not-allowed' : 'pointer',
                opacity: pagination.offset + pagination.limit >= pagination.total ? 0.6 : 1
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to format alert type
function formatAlertType(type) {
  if (!type) return 'Unknown';
  
  // Convert snake_case to Title Case
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to get background color based on severity
function getSeverityColor(severity) {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return '#fee' ; // very light red
    case 'high':
      return '#fff0f0'; // light red
    case 'medium':
      return '#fff8e6'; // light yellow
    case 'low':
      return '#f0fff0'; // light green
    default:
      return '#f5f5f5'; // light gray
  }
}

// Helper function to get border color based on severity
function getSeverityBorderColor(severity) {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return '#d00'; // dark red
    case 'high':
      return '#f44'; // red
    case 'medium':
      return '#fa0'; // orange
    case 'low':
      return '#0c0'; // green
    default:
      return '#aaa'; // gray
  }
}

// Helper function to get badge color based on severity
function getSeverityBadgeColor(severity) {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return '#d00'; // dark red
    case 'high':
      return '#f44'; // red
    case 'medium':
      return '#fa0'; // orange
    case 'low':
      return '#0c0'; // green
    default:
      return '#aaa'; // gray
  }
}

export default AnomalyDetection;