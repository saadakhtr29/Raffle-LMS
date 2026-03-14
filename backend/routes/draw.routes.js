const express = require('express');
const router = express.Router();
const drawController = require('../controllers/draw.controller');
const authMiddleware = require('../middleware/auth.middleware');

const { validate, schemas } = require('../middleware/validation.middleware');

router.use(authMiddleware);

router.post('/start', validate(schemas.draw.start), drawController.startDraw);
router.post('/remove', validate(schemas.draw.remove), drawController.removeTicket);
router.get('/history', drawController.getHistory);

module.exports = router;
