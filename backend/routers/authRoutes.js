const express = require('express');
const router = express.Router();
const { registerUser, loginUser , getUserById, updateUser,} = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { getAllUsers , logs} = require('../controllers/adminController');
const {fetchLogs} = require('../controllers/logsController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/all-users', authenticate,checkRole("admin"), getAllUsers);
router.put('/:id', authenticate, updateUser);
router.get('/logs', authenticate, logs);
router.get('/:id', authenticate, getUserById);
router.get('/logs', authenticate, fetchLogs);

module.exports = router;