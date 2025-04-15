// src/components/SidebarAnomalyAlert.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import socketService from './services/socketService';
console.log('Socket service imported:', socketService);

const SidebarAnomalyAlert = () => {
  const [alertCount, setAlertCount] = useState(0);
  const [hasHighSeverity, setHasHighSeverity] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const initializeSocket = async () => {
      await socketService.connect();
      
      // Check directly if the socket is connected
      const isConnected = socketService.isSocketConnected();
      console.log('Socket connected status:', isConnected);
      setConnected(isConnected);
    };
    
    initializeSocket();
    
    // Check connection status every second for debugging
    const intervalId = setInterval(() => {
      const isConnected = socketService.isSocketConnected();
      setConnected(isConnected);
    }, 1000);
    
    return () => {
      clearInterval(intervalId);
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