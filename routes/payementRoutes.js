const express = require('express');
const payementController = require('../controllers/payementController');

const router = express.Router();

// Route pour ajouter un payement
router.post('/create', payementController.ajouterPayement);

// Route pour récupérer la liste des payements
router.get('/liste', payementController.listerPayement);

router.get('/compte', payementController.compterPayementDuJour);


module.exports = router;
