const express = require('express');
const router = express.Router();
const { assignSiteToUser } = require('../controllers/userController');
const authenticate = require('../middleware/auth');

// This route allows an admin (or an authenticated user) to assign a site
router.post('/assign-site', authenticate, assignSiteToUser);

module.exports = router;
