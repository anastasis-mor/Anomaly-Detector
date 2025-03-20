const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const main = require('./config/connection');
const userRouter = require('./routers/authRoutes');


const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());
app.use("/user", userRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});