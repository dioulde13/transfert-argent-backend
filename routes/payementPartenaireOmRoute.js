const express = require('express');
const payementPartenaireOmController = require('../controllers/payementPartenaireOmController');

const router = express.Router();

router.get('/liste', payementPartenaireOmController.recupererPayementPartenaireOm);
router.post('/create', payementPartenaireOmController.ajouterPayementPartenaireOm);

module.exports = router;
