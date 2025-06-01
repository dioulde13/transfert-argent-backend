const express = require('express');
const verifierCaisseController = require('../controllers/verifierCaisseController');

const router = express.Router();

// Route pour ajouter un partenaire
router.post('/create', verifierCaisseController.ajouterCaisse); 

// Route pour récupérer la liste des partenaires
router.get('/liste', verifierCaisseController.listeCaisse);

router.get('/listeParJours', verifierCaisseController.listeCaisseParJour);

module.exports = router;