const Echange = require("../models/echanger");
const Utilisateur = require("../models/utilisateurs");
const Devise = require("../models/devises");
const { Sequelize } = require("sequelize");
const Partenaire = require("../models/partenaires");

const ajoutSoldePartenaire = async (req, res) => {
  try {
    const { utilisateurId, partenaireId, deviseId, montant } = req.body;

    const devise = await Devise.findByPk(deviseId);
    if (!devise) {
      return res.status(404).json({ message: "Devise introuvable." });
    }

    const partenaire = await Partenaire.findByPk(partenaireId);
    if (!partenaire) {
      return res.status(404).json({ message: "Partenaire introuvable." });
    }

    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    console.log(Number(montant));

    if (devise.signe_2 === "XOF") {
      utilisateur.sign = devise.signe_2;
      utilisateur.solde_echange =
        Number(utilisateur.solde_echange || 0) + Number(montant);
      await utilisateur.save();

      partenaire.montant_credit =
        Number(partenaire.montant_credit || 0) + Number(montant);
      await partenaire.save();
    } else if (devise.signe_2 === "USD") {
      utilisateur.sign_dollar = devise.signe_2; // Assigner uniquement la devise
      utilisateur.solde_echange_dollar =
        Number(utilisateur.solde_echange_dollar || 0) + Number(montant);
      await utilisateur.save();

      partenaire.montant_credit_dollar =
        Number(partenaire.montant_credit_dollar || 0) + Number(montant);
      await partenaire.save();
    } else if (devise.signe_2 === "EURO") {
      utilisateur.sign_euro = devise.signe_2;
      utilisateur.solde_echange_euro =
        Number(utilisateur.solde_echange_euro || 0) + Number(montant);
      await utilisateur.save();

      partenaire.montant_credit_euro =
        Number(partenaire.montant_credit_euro || 0) + Number(montant);
      await partenaire.save();
    }

    res.status(200).json({ message: "Ajouté avec succès.", partenaire });
  } catch (error) {
    console.error("Erreur lors de l'ajout :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const ajouterEchange = async (req, res) => {
  try {
    const { utilisateurId, nom, montant_devise, deviseId } = req.body;

    // ✅ Vérification des champs requis
    if (!utilisateurId || !nom || !montant_devise || !deviseId) {
      return res
        .status(400)
        .json({ message: "Tous les champs sont obligatoires." });
    }

    // ✅ Vérification de l'existence de l'utilisateur
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // ✅ Vérification de l'existence de la devise
    const devise = await Devise.findByPk(deviseId);
    if (!devise) {
      return res.status(404).json({ message: "Devise introuvable." });
    }

    // ✅ Récupération des informations de la devise
    const Prix1 = devise.prix_1 || 0;
    const Prix2 = devise.prix_2 || 0;
    const Sign1 = devise.signe_1 || "";
    const Sign2 = devise.signe_2 || "";

    // ✅ Calcul du montant dû
    const montant_due = (montant_devise / Prix1) * Prix2;

    // ✅ Génération d'un code de référence unique
    const generateUniqueCode = async () => {
      let newCode = "AB0001";
      const lastEntry = await Echange.findOne({
        order: [["createdAt", "DESC"]],
      });

      if (lastEntry) {
        const lastCode = lastEntry.code || "";
        const numericPart = parseInt(lastCode.slice(2), 10);

        if (!isNaN(numericPart)) {
          newCode = `AB${(numericPart + 1).toString().padStart(4, "0")}`;
        }
      }

      // Vérification de l'unicité du code
      while (await Echange.findOne({ where: { code: newCode } })) {
        const randomSuffix = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();
        newCode = `REF${randomSuffix}`;
      }

      return newCode;
    };

    const newCode = await generateUniqueCode();

    // ✅ Création d'un nouvel échange
    const echange = await Echange.create({
      utilisateurId,
      deviseId,
      nom,
      code: newCode,
      montant_gnf: montant_due,
      montant_devise,
      signe_1: Sign1,
      signe_2: Sign2,
      prix_1: Prix1,
      prix_2: Prix2,
    });

    // ✅ Réponse en cas de succès
    res.status(201).json({
      message: "Échange ajouté avec succès.",
      echange,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'échange :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Compter le nombre d'entrées du jour actuel
const compterEchangeDuJour = async (req, res) => {
  try {
    // Obtenir la date actuelle au format YYYY-MM-DD
    const dateActuelle = new Date().toISOString().slice(0, 10);

    const nombreEchange = await Echange.count({
      where: Sequelize.where(
        Sequelize.fn("DATE", Sequelize.col("date_creation")),
        dateActuelle
      ),
    });

    res.status(200).json({
      date: dateActuelle,
      nombre_echange: nombreEchange,
    });
  } catch (error) {
    console.error("Erreur lors du comptage des entrées du jour :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const recupererEchange = async (req, res) => {
  try {
    // Récupérer tous les partenaires avec les informations de l'utilisateur associé
    const echange = await Echange.findAll({
      include: [
        {
          model: Utilisateur,
          attributes: ["id", "nom", "prenom", "email", "solde"], // Champs nécessaires de l'utilisateur
        },
        {
          model: Devise,
          attributes: [
            "id",
            "paysDepart",
            "paysArriver",
            "signe_1",
            "signe_2",
            "prix_1",
            "prix_2",
          ], // Champs nécessaires de la devise
        },
      ],
      order: [["date_creation", "DESC"]],
    });

    // Si aucun partenaire n'est trouvé
    if (echange.length === 0) {
      return res.status(404).json({ message: "Aucun credit trouvé." });
    }

    res.status(200).json(echange);
  } catch (error) {
    console.error("Erreur lors de la récupération des echange :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const modifier = async (req, res) => {
  try {
    const { id } = req.params;

    const { montant_credit, montant_credit_dollar, montant_credit_euro } =
      req.body;

    const partenaire = await Partenaire.findByPk(id);
    if (!partenaire) {
      return res.status(404).json({ message: "Partenaire non trouvé" });
    }

    // Mettre à jour les informations de l'utilisateur
    await partenaire.update({
      montant_credit,
      montant_credit_dollar,
      montant_credit_euro,
    });

    return res
      .status(200)
      .json({ message: "Partenaire mis à jour avec succès", partenaire });
  } catch {}
};

module.exports = {
  ajouterEchange,
  recupererEchange,
  compterEchangeDuJour,
  ajoutSoldePartenaire,
  modifier,
};
