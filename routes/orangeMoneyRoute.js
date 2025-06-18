const express = require('express');
const orangeMoneyController = require('../controllers/orangeMoneyController');

const router = express.Router();

router.get('/liste', orangeMoneyController.recupererOrangeMoney);
router.post('/create', orangeMoneyController.ajouterDepotRetrait);
router.put('/valider/:reference', orangeMoneyController.validerOrangeMoney);

module.exports = router;
