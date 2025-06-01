const express = require('express');
const echangeController = require('../controllers/echangeController');

const router = express.Router();

// Route pour ajouter une entrée
router.post('/create', echangeController.ajouterEchange);

// Route pour récupérer la liste des entrées avec les informations des utilisateurs et des partenaires associés
router.get('/liste', echangeController.recupererEchange);

router.get('/compte', echangeController.compterEchangeDuJour);

router.put('/soldePartenaire', echangeController.ajoutSoldePartenaire);

router.put('/modifier/:id', echangeController.modifier)

module.exports = router;
