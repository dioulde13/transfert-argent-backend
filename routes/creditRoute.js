const express = require('express');
const creditController = require('../controllers/creditController');

const router = express.Router();

// Route pour ajouter une entrée
router.post('/create', creditController.ajouterCredit);

// Route pour récupérer la liste des entrées avec les informations des utilisateurs et des partenaires associés
router.get('/liste', creditController.recupererCredit);

router.put('/annuler', creditController.annulerCredit);


module.exports = router;
