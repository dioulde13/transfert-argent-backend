const Credit = require("../models/credit");
const Utilisateur = require("../models/utilisateurs");

const ajouterCredit = async (req, res) => {
  try {
    const { utilisateurId, type, nom, montant } = req.body;

    // Vérification des champs requis
    if (!utilisateurId || !nom || !type || !montant) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    // Vérification que montant est un nombre positif
    if (isNaN(montant) || montant <= 0) {
      return res.status(400).json({ message: "Le montant doit être un nombre positif." });
    }

    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Génération du code unique
    const generateUniqueCode = async () => {
      // Valeur initiale par défaut
      let newCode = "REF0001";

      // Récupérer la dernière entrée triée par date de création
      const lastEntry = await Credit.findOne({
        order: [["createdAt", "DESC"]],
      });

      if (lastEntry && lastEntry.reference && lastEntry.reference.startsWith("REF")) {
        const numericPart = parseInt(lastEntry.reference.slice(3), 10);

        if (!isNaN(numericPart)) {
          const incrementedPart = (numericPart + 1).toString().padStart(4, "0");
          newCode = `REF${incrementedPart}`;
        }
      }

      return newCode;
    };


    const newCode = await generateUniqueCode();
    let credit;

    if (type === "SORTIE") {
      if (utilisateur.solde < montant) {
        return res.status(400).json({ message: "Solde insuffisant." });
      } else {
        credit = await Credit.create({
          utilisateurId,
          nom,
          type,
          reference: newCode,
          montant,
        });

        utilisateur.solde -= montant;
      }
    } else if (type === "ENTRE") {
      credit = await Credit.create({
        utilisateurId,
        nom,
        type,
        reference: newCode,
        montant,
      });

      utilisateur.solde += montant;

    } else {
      return res.status(400).json({ message: "Type de crédit invalide." });
    }

    await utilisateur.save();

    return res.status(201).json({
      message: "Crédit ajouté avec succès.",
      credit,
    });

  } catch (error) {
    console.error("Erreur lors de l'ajout du crédit :", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const annulerCredit = async (req, res) => {
  try {
    const { reference } = req.body;

    const credit = await Credit.findOne({ where: { reference } });
    if (!credit) return res.status(404).json({ message: "crédit introuvable." });

    const [utilisateur] = await Promise.all([
      Utilisateur.findByPk(credit.utilisateurId),
    ]);
    if (!utilisateur) return res.status(404).json({ message: "Utilisateur introuvable." });

    if (credit.type === "SORTIE") {
      if (utilisateur.solde >= credit.montant) {
        if (credit.montantPaye === 0) {
          utilisateur.solde += Number(credit.montant);
          credit.type = "ANNULEE";
          await utilisateur.save();
          await credit.save();
        } else {
          utilisateur.solde += Number(credit.montantPaye);
          credit.type = "ANNULEE";
          await utilisateur.save();
          await credit.save();
        }
        res.status(200).json({ message: "crédit annulée avec succès." });
      } else {
        return res.status(400).json({ message: "Solde insuffisant." });
      }
    } else if (credit.type === "ENTRE") {
      if (utilisateur.solde >= credit.montant) {
        if (credit.montantPaye === 0) {
          utilisateur.solde -= Number(credit.montant);
          credit.type = "ANNULEE";
        } else {
          utilisateur.solde -= Number(credit.montantPaye);
          credit.type = "ANNULEE";
        }
        await utilisateur.save();
        await credit.save();
        res.status(200).json({ message: "crédit annulée avec succès." });
      } else {
        return res.status(400).json({ message: "Solde insuffisant." });
      }
    } else {
      res.status(200).json({ message: "Ce crédit est déjà annulée." });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};


const recupererCredit = async (req, res) => {
  try {
    // Récupérer tous les partenaires avec les informations de l'utilisateur associé
    const credit = await Credit.findAll({
      include: [
        {
          model: Utilisateur,
          attributes: ["id", "nom", "prenom", "email"], // Vous pouvez spécifier les attributs que vous voulez afficher
        },
      ],
      order: [["date_creation", "DESC"]],
    });

    // Si aucun partenaire n'est trouvé
    if (credit.length === 0) {
      return res.status(404).json({ message: "Aucun credit trouvé." });
    }

    res.status(200).json(credit);
  } catch (error) {
    console.error("Erreur lors de la récupération des credit :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};


module.exports = { ajouterCredit, recupererCredit, annulerCredit };
