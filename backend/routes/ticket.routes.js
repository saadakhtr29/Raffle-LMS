const express = require('express');
const router = express.Router();
const multer = require('multer');
const ticketController = require('../controllers/ticket.controller');
const authMiddleware = require('../middleware/auth.middleware');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', authMiddleware, upload.single('file'), ticketController.uploadTickets);
router.get('/', authMiddleware, ticketController.searchTickets);

module.exports = router;
