const express = require('express');
const calculBeneficeController = require('../controllers/calculBeneficeController');

const router = express.Router();

router.post('/benefice', calculBeneficeController.calculBenefice);
router.get('/benefice/authomatique', calculBeneficeController.calculBeneficeAuthomatique);


module.exports = router;
