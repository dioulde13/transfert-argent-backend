const express = require('express');
const entreController = require('../controllers/entreController');

const router = express.Router();

// Route pour ajouter une entrée
router.post('/create', entreController.ajouterEntre);

router.post('/createAutre', entreController.ajouterAutreEntre);

// Route pour récupérer la liste des entrées avec les informations des utilisateurs et des partenaires associés
router.get('/liste', entreController.recupererEntreesAvecAssocies);

router.get('/compte', entreController.compterEntreesDuJour);

router.put("/annuler/:code", entreController.annulerEntre);

router.post('/payer', entreController.payerEntrees);



module.exports = router;
