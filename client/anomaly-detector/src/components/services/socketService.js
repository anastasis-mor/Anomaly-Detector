import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
  }

  // Get the current socket instance
  getSocket() {
    return this.socket;
  }

  // Check if socket is connected
  isSocketConnected() {
    return this.isConnected;
  }

  // Connect to the socket server with a specific siteId
  async connect(siteId = null) {
    // Disconnect existing socket if there is one
    console.log("Starting socket connection with provided siteId:", siteId);
    if (this.socket) {
      this.disconnect();
    }

    try {
      // Use provided siteId or try to fetch it
      let useSiteId = siteId;
      
      if (!useSiteId) {
        // Try to get the site ID from localStorage
        useSiteId = localStorage.getItem('userSiteId');
        console.log("Retrieved siteId from localStorage:", useSiteId);

        // If not in localStorage, fetch from API
        if (!useSiteId) {
          const token = localStorage.getItem('authToken');
          console.log("No siteId in localStorage, fetching from API with token:", token ? "Token exists" : "No token");
          if (token) {
            try {
              const response = await fetch('http://localhost:8080/user/me/site', {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              console.log("API response status:", response.status);

              if (response.ok) {
                const data = await response.json();
                console.log("API response data:", data);
                useSiteId = data.siteId;
                localStorage.setItem('userSiteId', useSiteId);
                console.log("Saved siteId to localStorage:", useSiteId);
              } else {
                console.error('Failed to fetch site ID, response status:', response.status);
            const errorText = await response.text();
            console.error('Error response:', errorText);
              }
            } catch (error) {
              console.error('Error fetching site ID:', error);
            }
          }
        }
      }
      console.log("Final siteId for socket connection:", useSiteId);
      // Validate that we have a siteId
      if (!useSiteId) {
        console.error('No siteId available for socket connection');
        return null;
      }
      
      console.log('Connecting socket with site ID:', useSiteId);
      
      // Connect to socket server
      this.socket = io('http://localhost:8080', {
        query: { siteId: useSiteId }
      });
      
      // Set up base event handlers
      this.socket.on('connect', () => {
        console.log('Socket connected with ID:', this.socket.id);
        this.isConnected = true;
        this.notifyListeners('connection', { connected: true });
      });
      
      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        this.isConnected = false;
        this.notifyListeners('connection', { connected: false });
      });
      
      // Set up event handlers for alerts
      this.socket.on('alert', (data) => {
        console.log('Received alert:', data);
        this.notifyListeners('alert', data);
      });
      
      this.socket.on('alert_resolved', (data) => {
        console.log('Alert resolved:', data);
        this.notifyListeners('alert_resolved', data);
      });
      
      this.socket.on('alerts_cleared', (data) => {
        console.log('Alerts cleared:', data);
        this.notifyListeners('alerts_cleared', data);
      });
      
      return this.socket;
    } catch (error) {
      console.error('Error connecting to socket:', error);
      return null;
    }
  }
  
  // Disconnect from the socket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Socket disconnected');
    }
  }
  
  // Add a listener for a specific event
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event).push(callback);
    
    // If we're already connected and this is the connection event,
    // immediately call the callback with the current state
    if (event === 'connection' && this.isConnected) {
      callback({ connected: true });
    }
    
    return () => this.removeListener(event, callback);
  }
  
  // Remove a specific listener
  removeListener(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const eventListeners = this.listeners.get(event);
    const index = eventListeners.indexOf(callback);
    
    if (index !== -1) {
      eventListeners.splice(index, 1);
    }
    
    if (eventListeners.length === 0) {
      this.listeners.delete(event);
    }
  }
  
  // Notify all listeners for a specific event
  notifyListeners(event, data) {
    if (!this.listeners.has(event)) return;
    
    for (const callback of this.listeners.get(event)) {
      callback(data);
    }
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;