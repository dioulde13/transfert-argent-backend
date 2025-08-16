const express = require('express');
const entreController = require('../controllers/entreController');
// const authMiddleware = require('./authMiddleware'); // importation du middleware

const router = express.Router();

// Route pour ajouter une entrée (protégée)
router.post('/create', entreController.ajouterEntre);

router.post('/createAutre', entreController.ajouterAutreEntre);

// Route pour récupérer la liste des entrées avec les infos des utilisateurs et partenaires associés (protégée)
router.get('/liste', entreController.recupererEntreesAvecAssocies);

router.get('/compte', entreController.compterEntreesDuJour);

router.put('/annuler/:code', entreController.annulerEntre);

router.post('/payer', entreController.payerEntrees);

router.put("/modifier/:id", entreController.modifierEntre);


module.exports = router;
