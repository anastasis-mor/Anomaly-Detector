const ApiKey = require("../models/apiKey");
const Site = require('../models/siteModel');

const authenticateAPIKey = async (req, res, next) => {
    const apiKey = req.header("x-api-key");

    if (!apiKey) {
        return res.status(403).json({ message: "No API key provided" });
    }

    const validKey = await ApiKey.findOne({ apiKey });

    if (!validKey) {
        return res.status(401).json({ message: "Invalid API key" });
    }

    const site = await Site.findOne({ apiKey: validKey._id });
    
    if (!site) {
      return res.status(403).json({ error: 'No site associated with this API key' });
    }
    
    req.site = site;
    req.apiKey = validKey;

    next();
};

module.exports = { authenticateAPIKey };
