const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const main = require('./config/connection');
const userRouter = require('./routers/authRoutes');
const integrationRoutes = require('./routers/integrationRoutes');
const logsRoutes = require('./routers/logsRoutes');
const timeseriesRoutes = require('./routers/timeseriesRoutes');


require('./cronJobs');

const app = express();
const PORT = process.env.PORT || 8080;

main().catch(err => console.log(err));
app.use(express.json());
app.use(cors());
app.use("/user", userRouter);
app.use('/api/integration', integrationRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/logs/timeseries', timeseriesRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});