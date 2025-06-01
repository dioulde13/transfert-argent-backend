const express = require('express');
const echangePayementController = require('../controllers/payementEchangeController');

const router = express.Router();

// Route pour ajouter une entrée
router.post('/create', echangePayementController.ajouterPayementEchange);

// Route pour récupérer la liste des entrées avec les informations des utilisateurs et des partenaires associés
router.get('/liste', echangePayementController.listerPayementEchange);

router.get('/compte', echangePayementController.compterPayementEchangeDuJour);


module.exports = router;
