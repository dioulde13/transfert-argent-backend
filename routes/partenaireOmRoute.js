const express = require('express');
const partenaireOmController = require('../controllers/partenaireOmController');

const router = express.Router();

router.get('/liste', partenaireOmController.recupererPartenaireOm);
router.post('/create', partenaireOmController.ajouterPartenaireOm);

module.exports = router;
