const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/userAuth');

// Route pour ajouter un utilisateur
router.post('/add', utilisateurController.ajouterUtilisateur);

// Route pour connecter un utilisateur
router.post('/login', utilisateurController.login);

// Route pour connecter un utilisateur
router.get('/all', utilisateurController.getAllUser);

router.post('/rechargerSolde', utilisateurController.rechargerSolde);

router.get('/infoUser', utilisateurController.getUserInfo);

router.put('/utilisateurs/:id', utilisateurController.modifier);


module.exports = router;
