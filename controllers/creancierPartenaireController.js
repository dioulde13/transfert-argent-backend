const CreancierPartenaire = require("../models/creancierPartenaire");
const Utilisateur = require("../models/utilisateurs");
const Partenaire = require("../models/partenaires");

const ajouterCreancierPartenaire = async (req, res) => {
  try {
    const { utilisateurId, partenaireId, date_creation, montant } = req.body;

    if (!utilisateurId || !partenaireId || !date_creation || !montant) {
      return res
        .status(400)
        .json({ message: "Tous les champs sont obligatoires." });
    }

    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const partenaire = await Partenaire.findByPk(partenaireId);
    if (!partenaire) {
      return res.status(404).json({ message: "Partenaire introuvable." });
    }

    const partenaireCreancier = await CreancierPartenaire.create({
      utilisateurId,
      partenaireId,
      date_creation,
      montant,
    });

    // partenaire.montant_credit_Xof =
    //   (partenaire.montant_credit_Xof || 0) + Number(montant);
    // await partenaire.save();

    utilisateur.soldeXOF = Number(utilisateur.soldeXOF || 0) + Number(montant);
    await utilisateur.save();

    res.status(201).json({
      message: "Partenaire ajouté avec succès.",
      partenaireCreancier,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du partenaire :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};



const recupererCreancierPartenaires = async (req, res) => {
  try {
    const partenaireCreancier = await CreancierPartenaire.findAll({
      include: [
        {
          model: Utilisateur,
          attributes: ["id", "nom", "prenom", "email"],
        },
      ],
      include: [
        {
          model: Partenaire,
          attributes: ["id", "nom", "prenom", "montant_preter", "pays"],
        },
      ],
    });

    if (partenaireCreancier.length === 0) {
      return res.status(404).json({ message: "Aucun partenaire trouvé." });
    }

    res.status(200).json(partenaireCreancier);
  } catch (error) {
    console.error("Erreur lors de la récupération des partenaires :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};


module.exports = { ajouterCreancierPartenaire, recupererCreancierPartenaires };
