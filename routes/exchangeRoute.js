const express = require('express');
const exchangeController = require('../controllers/exchangeController');

const router = express.Router();

// Route pour ajouter un payement
router.post('/create', exchangeController.ajouterExchange);

// Route pour récupérer la liste des payements
router.get('/liste', exchangeController.recupererExchange);

module.exports = router;
