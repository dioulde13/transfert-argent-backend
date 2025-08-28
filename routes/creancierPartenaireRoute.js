const express = require('express');
const creancierPartenaireController = require('../controllers/creancierPartenaireController');

const router = express.Router();

// Route pour ajouter un payement
router.post('/create', creancierPartenaireController.ajouterCreancierPartenaire);

// Route pour récupérer la liste des payements
router.get('/liste', creancierPartenaireController.recupererCreancierPartenaires);

module.exports = router;
