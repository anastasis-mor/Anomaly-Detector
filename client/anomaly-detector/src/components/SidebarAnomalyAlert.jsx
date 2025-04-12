import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';

const SidebarAnomalyAlert = () => {
  const [alertCount, setAlertCount] = useState(0);
  const [hasHighSeverity, setHasHighSeverity] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to socket server
    const socket = io('http://localhost:8080', {
      query: { siteId: '67f438c6307f75fd26a4f160' }
    });
    
    socket.on('connect', () => {
        console.log('Sidebar socket connected with ID:', socket.id);
        setConnected(true);
      });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('alert', (data) => {
      console.log('Sidebar received alert:', data);
      setAlertCount(prev => prev + 1);
      
      if (data.severity === 'High' || data.severity === 'Critical') {
        setHasHighSeverity(true);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ marginBottom: '20px' }}>
      <h4>Live Anomaly Detection</h4>
      
      <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
        Status: {connected ? (
          <span style={{ color: 'green', fontWeight: 'bold' }}>Connected</span>
        ) : (
          <span style={{ color: 'red', fontWeight: 'bold' }}>Disconnected</span>
        )}
      </div>
      
      {alertCount > 0 ? (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ 
            fontWeight: 'bold', 
            color: hasHighSeverity ? 'red' : 'inherit'
          }}>
            {alertCount} alert{alertCount !== 1 ? 's' : ''} detected
          </div>
          
          {hasHighSeverity && (
            <div style={{ color: 'red', fontWeight: 'bold', fontSize: '0.9rem' }}>
              High severity threats!
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
          No anomalies detected yet.
        </div>
      )}
      
      <Link 
        to="/anomaly" 
        style={{ 
          display: 'block',
          background: hasHighSeverity ? '#d00' : '#0066cc',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '4px',
          textAlign: 'center',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: 'bold'
        }}
      >
        {hasHighSeverity ? 'View Critical Alerts!' : 'View All Alerts'}
      </Link>
    </div>
  );
};

export default SidebarAnomalyAlert;