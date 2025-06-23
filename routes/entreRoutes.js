const express = require('express');
const entreController = require('../controllers/entreController');
const authMiddleware = require('./authMiddleware'); // importation du middleware

const router = express.Router();

// Route pour ajouter une entrée (protégée)
router.post('/create', authMiddleware, entreController.ajouterEntre);

router.post('/createAutre', authMiddleware, entreController.ajouterAutreEntre);

// Route pour récupérer la liste des entrées avec les infos des utilisateurs et partenaires associés (protégée)
router.get('/liste', authMiddleware, entreController.recupererEntreesAvecAssocies);

router.get('/compte', authMiddleware, entreController.compterEntreesDuJour);

router.put('/annuler/:code', authMiddleware, entreController.annulerEntre);

router.post('/payer', authMiddleware, entreController.payerEntrees);

module.exports = router;
