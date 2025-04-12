const socketIO = require('socket.io');

let io;

const initSocket = (server) => {
  console.log('Socket.io initialization started');
  io = socketIO(server, {
    cors: {
      origin: "*", // Update with your specific origins in production
      methods: ["GET", "POST"]
    }
  });

  // io.on('connection', (socket) => {
  //   console.log('Client connected:', socket.id);
    
  //   // Join site-specific room for targeted alerts
  //   const siteId = socket.handshake.query.siteId;
  //   if (siteId) {
  //     socket.join(siteId);
  //     console.log(`Socket ${socket.id} joined room for site ${siteId}`);
  //   }

  //   socket.on('disconnect', () => {
  //     console.log('Client disconnected:', socket.id);
  //   });
  // });
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join site-specific room for targeted alerts
    const siteId = socket.handshake.query.siteId;
    if (siteId) {
      socket.join(siteId);
      console.log(`Socket ${socket.id} joined room for site ${siteId}`);
      socket.emit('welcome', { message: `Welcome to room ${siteId}` });
    } else {
      console.log('No siteId provided in connection');
    }
  
    // Add a test event listener
    socket.on('test_connection', (data) => {
      console.log('Test connection received:', data);
      socket.emit('test_response', { message: 'Connection working!' });
    });
  
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
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