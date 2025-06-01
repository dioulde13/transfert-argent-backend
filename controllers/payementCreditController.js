const PayementCreadit = require('../models/payementCredit');
const Utilisateur = require('../models/utilisateurs');
const Credit = require('../models/credit');

const ajouterPayementCredit = async (req, res) => {
    try {
        const { utilisateurId, reference, montant } = req.body;

        // Vérification de la validité des données reçues
        if (!utilisateurId || !reference || !montant) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

        // Vérifier si l'utilisateur existe
        const utilisateur = await Utilisateur.findByPk(utilisateurId);
        if (!utilisateur) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Vérifier si le crédit existe via la référence
        const credit = await Credit.findOne({ where: { reference } });
        if (!credit) {
            return res.status(404).json({ message: "Crédit introuvable avec cette référence." });
        }
    if (utilisateur.solde >= montant) {
        // Calcul du montant total payé après le paiement actuel
        const montantEnCoursPayement = (credit.montantPaye || 0) + montant;

        // Vérification de dépassement
        if (montantEnCoursPayement > credit.montant) {
            const montantRestant = credit.montant - (credit.montantPaye || 0);
            return res.status(400).json({
                message: `Le montant payé (${montant.toLocaleString("fr-FR")} GNF) dépasse le montant restant (${montantRestant.toLocaleString("fr-FR")} GNF).`,
            });
        }

        // Mise à jour des montants payés et restants
        credit.montantPaye = montantEnCoursPayement;
        credit.montantRestant = credit.montant - credit.montantPaye;

        // Création du paiement
        const paiement = await PayementCreadit.create({
            utilisateurId,
            creditId: credit.id,
            reference,
            montant,
        });

        // Mise à jour du solde selon le type de paiement
        if (credit.type === "ENTRE") {
            utilisateur.solde = (utilisateur.solde || 0) - montant;
        } else if (credit.type === "SORTIE") {
            utilisateur.solde = (utilisateur.solde || 0) + montant;
        } else {
            return res.status(400).json({ message: "Type de paiement invalide (doit être ENTRE ou SORTIE)." });
        }

        // Sauvegarde des mises à jour
        await utilisateur.save();
        await credit.save();

        // Réponse en cas de succès
        return res.status(201).json({
            message: "Paiement ajouté avec succès.",
            paiement,
        });
        }
        else {
            const solde = Number(utilisateur.solde);
            res.status(400).json({
              message: `On ne peut pas faire une sortie de ${montant.toLocaleString(
                "fr-FR",
                { minimumFractionDigits: 0, maximumFractionDigits: 0 }
              )} GNF,
            le solde dans la caisse est: ${solde.toLocaleString("fr-FR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })} GNF`,
            });
          }

    } catch (error) {
        console.error("Erreur dans ajouterPayementCredit:", error);
        return res.status(500).json({ message: "Erreur lors de l'ajout du paiement.", erreur: error.message });
    }
};

const findAllPayements = async (req, res) => {
    try {
        const payements = await PayementCreadit.findAll({
            include: [
                {
                    model: Utilisateur,
                    attributes: ['id', 'nom', 'prenom', 'email'] // Infos de l'utilisateur
                },
                {
                    model: Credit,
                    attributes: ['id', 'nom', 'montant', 'montantPaye', 'montantRestant'] // Infos du crédit
                }
            ],
            order: [['date_creation', 'DESC']] // Trier par date décroissante
        });

        res.status(200).json(payements);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des paiements", error });
    }
};

module.exports = { ajouterPayementCredit, findAllPayements };
