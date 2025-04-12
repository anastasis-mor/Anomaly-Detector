const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const main = require('./config/connection');
const http = require('http');
const { initSocket } = require('./socket');
const cron = require('node-cron');
const { runChecksForAllSites } = require('./controllers/anomalyDetection');

const userRouter = require('./routers/authRoutes');
const integrationRoutes = require('./routers/integrationRoutes');
const logsRoutes = require('./routers/logsRoutes');
const timeseriesRoutes = require('./routers/timeseriesRoutes');
const alertRoutes = require('./routers/alertsRoutes');
const socketIO = require('./socket');
const Log = require('./models/logModel');


require('./cronJobs');

const app = express();
const PORT = process.env.PORT || 8080;

cron.schedule('* * * * *', async () => {
  console.log('Running scheduled anomaly detection...');
  await runChecksForAllSites();
});

const server = http.createServer(app);
initSocket(server);

main().catch(err => console.log(err));
app.use(express.json());
app.use(cors());
app.use("/user", userRouter);
app.use('/api/integration', integrationRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/logs/timeseries', timeseriesRoutes);
app.use('/api/alerts', alertRoutes);

app.get('/test-socket', (req, res) => {
  const io = require('./socket').getSocket();
  if (!io) {
    return res.status(500).send('Socket not initialized');
  }
  
  const testAlert = {
    message: 'Test alert',
    severity: 'High',
    timestamp: new Date(),
    type: 'test',
    siteId: '67f438c6307f75fd26a4f160' // Make sure this is set
  };
  
  // Save the alert to the database
  const Alert = require('./models/alertModel');
  const newAlert = new Alert(testAlert);
  
  newAlert.save()
    .then(savedAlert => {
      console.log('Test alert saved to database:', savedAlert);
      
      // Emit to specific room
      io.to('67f438c6307f75fd26a4f160').emit('alert', savedAlert);
      
      // Also emit globally for testing
      io.emit('alert', savedAlert);
      
      res.send('Test alert sent and saved to database');
    })
    .catch(error => {
      console.error('Error saving test alert:', error);
      res.status(500).send('Error saving test alert');
    });
});

app.get('/debug-check/:siteId', async (req, res) => {
  try {
    const { siteId } = req.params;
    console.log(`\n===== DEBUG CHECK FOR SITE ${siteId} =====`);
    
    // Check logs for this site
    const logs = await Log.find({ site: siteId })
      .sort({ timestamp: -1 })
      .limit(10);
    
    console.log(`Found ${logs.length} logs for site ${siteId}`);
    if (logs.length > 0) {
      console.log("Sample log:", JSON.stringify(logs[0], null, 2));
    }
    
    // Check failed logins
    const failedLogins = await Log.find({ 
      site: siteId,
      action: "failed_login"
    });
    console.log(`Found ${failedLogins.length} failed login logs for site ${siteId}`);
    
    // Run checks for this site
    await require('./controllers/anomalyDetection').runAllChecks(siteId);
    
    console.log(`===== END DEBUG CHECK =====\n`);
    
    res.json({ 
      message: 'Debug check completed', 
      logCount: logs.length,
      failedLoginCount: failedLogins.length
    });
  } catch (error) {
    console.error('Error in debug check:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/activate-site/:siteId', async (req, res) => {
  try {
    const { siteId } = req.params;
    const Site = require('./models/siteModel');
    
    await Site.findByIdAndUpdate(siteId, { status: 'active' });
    res.send(`Site ${siteId} marked as active`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


server.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});