const express = require('express');
const router = express.Router();
const prizeController = require('../controllers/prize.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/', prizeController.createPrize);
router.get('/', prizeController.getPrizes);
router.put('/:id', prizeController.updatePrize);
router.delete('/:id', prizeController.deletePrize);

module.exports = router;
