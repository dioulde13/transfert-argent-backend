const express = require('express');
const beneficeController = require('../controllers/beneficeController');

const router = express.Router();

router.get('/benefice', beneficeController.donneBenefice);

module.exports = router;
