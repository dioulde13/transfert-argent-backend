const express = require("express");
const sortieController = require("../controllers/sortieController");

const router = express.Router();

// Route pour ajouter une sortie
router.post("/create", sortieController.ajouterSortie);

// Route pour récupérer la liste des sorties avec les informations des utilisateurs et des partenaires associés
router.get("/liste", sortieController.recupererSortiesAvecAssocies);

router.get("/compte", sortieController.compterSortieDuJour);

router.post("/ajouterAutre", sortieController.ajouterAutreSortie);

router.put("/annuler/:code", sortieController.annulerSortie);

router.put("/valider/:code", sortieController.validerSortie);

router.post('/payer', sortieController.payerSorties);

module.exports = router;
