const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const { validate, schemas } = require('../middleware/validation.middleware');

router.post('/login', validate(schemas.auth.login), authController.login);

module.exports = router;
