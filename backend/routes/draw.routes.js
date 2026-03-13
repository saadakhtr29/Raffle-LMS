const express = require('express');
const router = express.Router();
const drawController = require('../controllers/draw.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/start', drawController.startDraw);
router.post('/remove', drawController.removeTicket);
router.get('/history', drawController.getHistory);

module.exports = router;
