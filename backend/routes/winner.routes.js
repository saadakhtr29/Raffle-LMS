const express = require('express');
const router = express.Router();
const winnerController = require('../controllers/winner.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/export', authMiddleware, winnerController.exportWinners);

module.exports = router;
