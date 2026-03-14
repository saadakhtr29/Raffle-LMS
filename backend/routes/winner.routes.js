const express = require('express');
const router = express.Router();
const winnerController = require('../controllers/winner.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, winnerController.getWinners);
router.get('/export', authMiddleware, winnerController.exportWinners);
router.get('/export/csv', authMiddleware, winnerController.exportWinnersCSV);

module.exports = router;
