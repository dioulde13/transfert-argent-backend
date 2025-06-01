const Utilisateur = require("../models/utilisateurs"); // Modèle Utilisateur
const Echange = require("../models/echanger"); // Modèle Partenaire
const PayementEchange = require("../models/payementEchange");
const { Sequelize } = require("sequelize");

const ajouterPayementEchange = async (req, res) => {
  try {
    const { utilisateurId, code, montant } = req.body;

    // ✅ Vérification des champs requis
    if (!utilisateurId || !code || !montant) {
      return res
        .status(400)
        .json({ message: "Tous les champs sont obligatoires." });
    }

    // ✅ Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // ✅ Vérifier si l'échange existe à travers le code
    const echange = await Echange.findOne({ where: { code } });
    if (!echange) {
      return res
        .status(404)
        .json({ message: "Échange introuvable avec ce code." });
    }

    const montantEnCoursPayement = montant + echange.montant_payer;
    console.log(montantEnCoursPayement);
    if (montantEnCoursPayement > echange.montant_gnf) {
      return res.status(400).json({
        message: "Le montant payer est supperieur au montant restant.",
      });
    } else {
      // Mettre à jour le montant payé et restant dans l'entrée
      echange.montant_payer = (echange.montant_payer ?? 0) + montant;
      echange.montant_restant =
        (echange.montant_gnf ?? 0) - echange.montant_payer;
    }

    // ✅ Enregistrer les modifications de l'échange
    await echange.save();

    // ✅ Ajouter une entrée dans la table PayementEchange
    const payementEchange = await PayementEchange.create({
      utilisateurId,
      echangeId: echange.id,
      code,
      montant,
    });

    // ✅ Réponse succès
    res.status(201).json({
      message: "Paiement ajouté avec succès.",
      payementEchange,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du paiement :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Compter le nombre d'entrées du jour actuel
const compterPayementEchangeDuJour = async (req, res) => {
  try {
    // Obtenir la date actuelle au format YYYY-MM-DD
    const dateActuelle = new Date().toISOString().slice(0, 10);

    const nombrePayementEchange = await PayementEchange.count({
      where: Sequelize.where(
        Sequelize.fn("DATE", Sequelize.col("date_creation")),
        dateActuelle
      ),
    });

    res.status(200).json({
      date: dateActuelle,
      nombre_Payement_echange: nombrePayementEchange,
    });
  } catch (error) {
    console.error("Erreur lors du comptage des sorties du jour :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Lister toutes les entrées de la table Rembourser avec associations
const listerPayementEchange = async (req, res) => {
  try {
    const payementsEchange = await PayementEchange.findAll({
      include: [
        {
          model: Utilisateur,
          attributes: ["id", "nom", "prenom", "email"], // Champs à inclure pour l'utilisateur
        },
        {
          model: Echange,
          attributes: ["id", "nom", "montant_payer", "montant_restant"], // Champs à inclure pour le partenaire
        },
      ],
    });

    if (payementsEchange.length === 0) {
      return res.status(404).json({ message: "Aucun payement trouvé." });
    }

    res.status(200).json(payementsEchange);
  } catch (error) {
    console.error("Erreur lors de la récupération des payement :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

module.exports = {
  ajouterPayementEchange,
  listerPayementEchange,
  compterPayementEchangeDuJour,
};
