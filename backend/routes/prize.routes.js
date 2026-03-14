const express = require('express');
const router = express.Router();
const prizeController = require('../controllers/prize.controller');
const authMiddleware = require('../middleware/auth.middleware');

const { validate, schemas } = require('../middleware/validation.middleware');

router.use(authMiddleware);

router.post('/', validate(schemas.prize.create), prizeController.createPrize);
router.get('/', prizeController.getPrizes);
router.get('/random', prizeController.getRandomPrize);
router.put('/:id', validate(schemas.prize.update), prizeController.updatePrize);
router.delete('/:id', prizeController.deletePrize);

module.exports = router;
