const PartenaireOM = require("../models/partenaireOM");
const Utilisateur = require("../models/utilisateurs");

const ajouterPartenaireOm = async (req, res) => {
  try {
    const { utilisateurId, nom, montant } = req.body;

    // Vérification des champs requis
    if (!utilisateurId || !nom || montant === undefined) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    // Conversion du montant en nombre
    const montantDepotNumber = parseFloat(montant);
    if (isNaN(montantDepotNumber) || montantDepotNumber < 0) {
      return res.status(400).json({ message: "Le montant déposé est invalide." });
    }

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Création du Partenaire OM
    const partenaireOm = await PartenaireOM.create({
      utilisateurId,
      nom,
      montant: montantDepotNumber,
    });

    // Mise à jour du solde de l'utilisateur
    utilisateur.solde += montantDepotNumber;
    utilisateur.soldePDV += montantDepotNumber;
    await utilisateur.save();

    return res.status(201).json({
      message: "PartenaireOM ajouté avec succès.",
      partenaireOm,
    });

  } catch (error) {
    console.error("Erreur lors de l'ajout du PartenaireOM :", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};



const recupererPartenaireOm = async (req, res) => {
  try {
    const partenaireOm = await PartenaireOM.findAll({
      include: [
        {
          model: Utilisateur,
          attributes: ["id", "nom", "prenom", "email"], // Vous pouvez spécifier les attributs que vous voulez afficher
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Si aucun partenaire n'est trouvé
    if (partenaireOm.length === 0) {
      return res.status(404).json({ message: "Aucun credit trouvé." });
    }

    res.status(200).json(partenaireOm);
  } catch (error) {
    console.error("Erreur lors de la récupération des credit :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};


module.exports = { recupererPartenaireOm, ajouterPartenaireOm };
