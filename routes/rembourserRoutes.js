const express = require('express');
const router = express.Router();
const { ajouterRemboursement, listerRemboursements, compterRembourserDuJour } = require('../controllers/rembourserController');

// Route pour ajouter un remboursement
router.post('/create', ajouterRemboursement);

// Route pour lister tous les remboursements
router.get('/liste', listerRemboursements);

router.get('/compte', compterRembourserDuJour);


module.exports = router;
