const express = require('express');
const depenseController = require('../controllers/depenseController');

const router = express.Router();

// Route pour ajouter une entrée
router.post('/create', depenseController.ajouterDepense);

// Route pour récupérer la liste des entrées avec les informations des utilisateurs et des partenaires associés
router.get('/liste', depenseController.recupererDepense);

router.get('/compte', depenseController.sommeDepenseAujourdHui);

module.exports = router;
