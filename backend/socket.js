const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel');

let io;

const initSocket = (server) => {
  console.log('Socket.io initialization started');
  io = socketIO(server, {
    cors: {
      origin: "*", // Update with your specific origins in production
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);
    
    // Extract authentication token and requested siteId
    const token = socket.handshake.auth.token;
    const requestedSiteId = socket.handshake.query.siteId;
    
    // Validate authentication
    if (!token) {
      console.log('No authentication token provided');
      socket.emit('auth_error', { message: 'Authentication required' });
      socket.disconnect();
      return;
    }
    
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find the user and check their site
      const user = await User.findById(decoded._id).populate('site');
      
      if (!user) {
        console.log('User not found');
        socket.emit('auth_error', { message: 'User not found' });
        socket.disconnect();
        return;
      }
      
      // Check if user has a site and if it matches the requested site
      if (!user.site) {
        console.log('User has no assigned site');
        socket.emit('auth_error', { message: 'No site assigned to user' });
        socket.disconnect();
        return;
      }
      
      const userSiteId = user.site._id.toString();
      
      // Only allow joining if the requested site matches the user's assigned site
      if (requestedSiteId !== userSiteId) {
        console.log(`User attempted to join unauthorized site. User site: ${userSiteId}, Requested: ${requestedSiteId}`);
        socket.emit('auth_error', { message: 'Not authorized for this site' });
        socket.disconnect();
        return;
      }
      
      // If everything is valid, join the room
      socket.join(userSiteId);
      console.log(`Socket ${socket.id} joined room for site ${userSiteId}`);
      socket.emit('welcome', { message: `Welcome to room ${userSiteId}` });
      
      // Add a test event listener
      socket.on('test_connection', (data) => {
        console.log('Test connection received:', data);
        socket.emit('test_response', { message: 'Connection working!' });
      });
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
      
    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.emit('auth_error', { message: 'Authentication failed' });
      socket.disconnect();
    }
  });

  return io;
};

const getSocket = () => {
  if (!io) {
    return null;
  }
  return io;
};

module.exports = {
  initSocket,
  getSocket
};