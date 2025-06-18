const PartenaireOM = require("../models/partenaireOM");
const PayementPartenaireOm = require("../models/PayementPartenaireOm");
const Utilisateur = require("../models/utilisateurs");


const ajouterPayementPartenaireOm = async (req, res) => {
    try {
        const { utilisateurId, type, partenaireOMId, montant_depot } = req.body;

        // Vérification des champs requis
        if (!utilisateurId || !type || !partenaireOMId || !montant_depot) {
            return res
                .status(400)
                .json({ message: "Tous les champs sont obligatoires." });
        }

        // Conversion du montant_depot en nombre
        const montantDepotNumber = parseFloat(montant_depot);
        if (isNaN(montantDepotNumber) || montantDepotNumber <= 0) {
            return res.status(400).json({ message: "Le montant déposé est invalide." });
        }

        // Vérifier si l'utilisateur existe
        const utilisateur = await Utilisateur.findByPk(utilisateurId);
        if (!utilisateur) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        // Vérifier si le partenaire existe
        const partenaire = await PartenaireOM.findByPk(partenaireOMId);
        if (!partenaire) {
            return res.status(404).json({ message: "Partenaire introuvable." });
        }

        // Traitement selon le type de paiement
        if (type === "REMBOURSEMENT") {
            if (partenaire.montant >= montantDepotNumber) {
                if (utilisateur.solde >= montantDepotNumber) {
                    const payemntPartenaireOm = await PayementPartenaireOm.create({
                        utilisateurId,
                        partenaireOMId,
                        montant_depot: montantDepotNumber,
                        type
                    });

                    // Mise à jour des soldes
                    utilisateur.solde -= montantDepotNumber;
                    await utilisateur.save();

                    partenaire.montant -= montantDepotNumber;
                    await partenaire.save();

                    return res.status(201).json({
                        message: "Payement Partenaire ajouté avec succès.",
                        payemntPartenaireOm,
                    });
                } else {
                    return res.status(400).json({ message: `Le solde dans la caisse est insuffisant: ${utilisateur.solde}`});
                }
            } else {
                return res.status(400).json({ message: `Le montant saisi est supérieur au montant restant du partenaire: ${partenaire.montant}` });
            }
        } else if (type === "DEPOT") {
            // Dans le cas d'un DEPOT, pas besoin de vérifier les soldes
            const payemntPartenaireOm = await PayementPartenaireOm.create({
                utilisateurId,
                partenaireOMId,
                montant_depot: montantDepotNumber,
                type
            });

            // Mise à jour des soldes
            utilisateur.solde += montantDepotNumber;
            utilisateur.soldePDV += montantDepotNumber;
            await utilisateur.save();

            partenaire.montant += montantDepotNumber;
            await partenaire.save();

            return res.status(201).json({
                message: "Payement Partenaire ajouté avec succès.",
                payemntPartenaireOm,
            });
        } else {
            return res.status(400).json({ message: "Type de paiement invalide." });
        }

    } catch (error) {
        console.error("Erreur lors de l'ajout du paiement :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};



const recupererPayementPartenaireOm = async (req, res) => {
    try {
        const payemntPartenaireOm = await PayementPartenaireOm.findAll({
            include: [
                {
                    model: Utilisateur,
                    attributes: ["id", "nom", "prenom", "email"],
                },
                {
                    model: PartenaireOM,
                    attributes: ['id','nom','montant']
                }
            ],
            order: [["createdAt", "DESC"]],
        });

        if (payemntPartenaireOm.length === 0) {
            return res.status(404).json({ message: "Aucun credit trouvé." });
        }

        res.status(200).json(payemntPartenaireOm);
    } catch (error) {
        console.error("Erreur lors de la récupération des credit :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};


module.exports = { recupererPayementPartenaireOm, ajouterPayementPartenaireOm };
