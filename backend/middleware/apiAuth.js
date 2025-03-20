const ApiKey = require("../models/apiKey");

const authenticateAPIKey = async (req, res, next) => {
    const apiKey = req.header("x-api-key");

    if (!apiKey) {
        return res.status(403).json({ message: "No API key provided" });
    }

    const validKey = await ApiKey.findOne({ apiKey });

    if (!validKey) {
        return res.status(401).json({ message: "Invalid API key" });
    }

    next();
};

module.exports = { authenticateAPIKey };
