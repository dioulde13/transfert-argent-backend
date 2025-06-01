const express = require('express');
const payementCreditController = require('../controllers/payementCreditController');

const router = express.Router();

// Route pour ajouter un payement
router.post('/create', payementCreditController.ajouterPayementCredit);

// Route pour récupérer la liste des payements
router.get('/liste', payementCreditController.findAllPayements);

module.exports = router;
