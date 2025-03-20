const mongoose = require("mongoose");

const apiKeySchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    apiKey: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("ApiKey", apiKeySchema);
