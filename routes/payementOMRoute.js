const express = require('express');
const payementOMController = require('../controllers/payementOmController');

const router = express.Router();

router.get('/liste', payementOMController.recupererPayementOM);

module.exports = router;
