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


server.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});