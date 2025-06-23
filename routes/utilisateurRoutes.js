const express = require('express');
const utilisateurController = require('../controllers/utilisateurController');
const authMiddleware = require('./authMiddleware'); // importation du middleware

const router = express.Router();

// Route pour ajouter un utilisateur
router.post('/create', utilisateurController.ajouterUtilisateur);

// Route pour récupérer la liste des utilisateurs
router.get('/liste', authMiddleware, utilisateurController.recupererUtilisateursAvecRequete);

module.exports = router;
