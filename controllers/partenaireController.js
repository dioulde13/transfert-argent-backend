const Partenaire = require("../models/partenaires");
const Utilisateur = require("../models/utilisateurs");
const Devise = require("../models/devises");

const ajouterPartenaire = async (req, res) => {
  try {
    const { utilisateurId, nom, prenom, pays, montant_preter } = req.body;

    // Vérifier si tous les champs nécessaires sont fournis
    if (
      !utilisateurId ||
      !nom ||
      !prenom ||
      !pays ||
      montant_preter === undefined
    ) {
      return res
        .status(400)
        .json({ message: "Tous les champs sont obligatoires." });
    }

    // Créer un nouveau partenaire
    const partenaire = await Partenaire.create({
      utilisateurId,
      nom,
      prenom,
      pays,
      montant_preter,
    });

    res.status(201).json({
      message: "Partenaire ajouté avec succès.",
      partenaire,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du partenaire :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};


// Modifier un partenaire
const modifierPartenaire = async (req, res) => {
  try {
    const { id } = req.params; // ID du partenaire à modifier
    const { utilisateurId, nom, prenom, pays, montant_preter } = req.body;

    // Vérifier si le partenaire existe
    const partenaire = await Partenaire.findByPk(id);
    if (!partenaire) {
      return res.status(404).json({ message: 'Partenaire non trouvée.' });
    }

    // Mettre à jour les champs fournis
    await partenaire.update({
      utilisateurId: utilisateurId || partenaire.utilisateurId,
      nom: nom || partenaire.nom,
      prenom: prenom || partenaire.prenom,
      pays: pays || partenaire.pays,
      montant_preter: montant_preter || partenaire.montant_preter
    });

    res.status(200).json({
      message: 'Ppartenaire mise à jour avec succès.',
      partenaire,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du partenaire :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};


const recupererPartenaires = async (req, res) => {
  try {
    // Récupérer tous les partenaires avec les informations de l'utilisateur associé
    const partenaires = await Partenaire.findAll({
      include: [
        {
          model: Utilisateur,
          attributes: ["id", "nom", "prenom", "email"], // Vous pouvez spécifier les attributs que vous voulez afficher
        },
      ],
    });

    // Si aucun partenaire n'est trouvé
    if (partenaires.length === 0) {
      return res.status(404).json({ message: "Aucun partenaire trouvé." });
    }

    res.status(200).json(partenaires);
  } catch (error) {
    console.error("Erreur lors de la récupération des partenaires :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const rembourserDevise = async (req, res) => {
  try {
    const { id } = req.params;
    const { deviseId, utilisateurId } = req.body;

    // Vérifier si le partenaire existe
    const partenaire = await Partenaire.findByPk(id);
    if (!partenaire) {
      return res.status(404).json({ message: "Partenaire non trouvé." });
    }

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Vérifier si la devise existe
    const devise = await Devise.findByPk(deviseId);
    if (!devise) {
      return res.status(404).json({ message: "Devise introuvable." });
    }

    // Traitement en fonction de la devise
    switch (devise.signe_2) {
      case "XOF":
        utilisateur.solde_echange = 0;
        await utilisateur.save();
        partenaire.montant_credit = 0;
        // partenaire.montant_preter = 0;
        await partenaire.save();
        break;

      case "USD":
        utilisateur.solde_echange_dollar = 0;
        await utilisateur.save();
        partenaire.montant_credit_dollar = 0;
        await partenaire.save();
        break;

      case "EUR":
        utilisateur.solde_echange_euro = 0;
        await utilisateur.save();
        partenaire.montant_credit_euro = 0;
        await partenaire.save();
        break;

      default:
        return res.status(400).json({ message: "Devise non supportée." });
    }

    return res
      .status(200)
      .json({ message: "Remboursement avec succès.", partenaire });
  } catch (error) {
    console.error("Erreur lors du remboursement :", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

module.exports = { ajouterPartenaire, recupererPartenaires, rembourserDevise, modifierPartenaire };
