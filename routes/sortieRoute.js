const express = require("express");
const sortieController = require("../controllers/sortieController");
const authMiddleware = require('./authMiddleware'); // importation du middleware


const router = express.Router();

// Route pour ajouter une sortie
router.post("/create", authMiddleware, sortieController.ajouterSortie);

// Route pour récupérer la liste des sorties avec les informations des utilisateurs et des partenaires associés
router.get("/liste", authMiddleware, sortieController.recupererSortiesAvecAssocies);

router.get("/compte", authMiddleware, sortieController.compterSortieDuJour);

router.post("/ajouterAutre", authMiddleware, sortieController.ajouterAutreSortie);

router.put("/annuler/:code", authMiddleware, sortieController.annulerSortie);

router.put("/valider/:code", authMiddleware, sortieController.validerSortie);

router.post('/payer', authMiddleware, sortieController.payerSorties);

module.exports = router;
