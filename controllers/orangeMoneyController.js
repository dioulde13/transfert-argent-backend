const OrangeMoney = require("../models/orangeMoney");
const Utilisateur = require("../models/utilisateurs");


const ajouterDepotRetrait = async (req, res) => {
    try {
        const { utilisateurId, type, montant } = req.body;

        // Logs pour vérification des données reçues
        console.log("Requête reçue :");
        console.log("utilisateurId :", utilisateurId);
        console.log("type :", type);
        console.log("montant :", montant);

        // Vérification des champs requis
        if (!utilisateurId || !type || !montant) {
            return res.status(400).json({ message: "Tous les champs sont obligatoires." });
        }

        // Conversion du montant en nombre
        const montantDepotNumber = parseFloat(montant);
        console.log("Montant converti :", montantDepotNumber);

        if (isNaN(montantDepotNumber) || montantDepotNumber < 0) {
            return res.status(400).json({ message: "Le montant déposé est invalide." });
        }

        // Vérifier si l'utilisateur existe
        const utilisateur = await Utilisateur.findByPk(utilisateurId);
        console.log("Utilisateur trouvé :", utilisateur);

        if (!utilisateur) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        // Génération du code unique
        const generateUniqueCode = async () => {
            let newCode = "REF0001";
            const lastEntry = await OrangeMoney.findOne({
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
        console.log("Code généré :", newCode);

        let orangeMoney;

        // Gestion des types : DEPOT ou RETRAIT
        if (type === "DEPOT") {
            console.log("Type d'opération : DEPOT");

            if (utilisateur.soldePDV >= montantDepotNumber) {
                orangeMoney = await OrangeMoney.create({
                    utilisateurId,
                    type,
                    reference: newCode,
                    montant: montantDepotNumber,
                });

                // Mise à jour des soldes
                utilisateur.solde -= montantDepotNumber;
                utilisateur.soldePDV -= montantDepotNumber;
                await utilisateur.save();

                console.log("Dépôt effectué avec succès.");
                return res.status(201).json({
                    message: "Dépôt ajouté avec succès.",
                });
            } else {
                // console.log("Solde PDV insuffisant :", utilisateur.soldePDV);
                return res.status(400).json({ message: `Solde PDV insuffisant: ` + utilisateur.soldePDV });
            }

        } else if (type === "RETRAIT") {

            if (utilisateur.solde >= montantDepotNumber) {
                orangeMoney = await OrangeMoney.create({
                    utilisateurId,
                    type,
                    reference: newCode,
                    montant: montantDepotNumber,
                });

                // Mise à jour des soldes
                utilisateur.solde += montantDepotNumber; // Correction : diminution du solde utilisateur
                utilisateur.soldePDV += montantDepotNumber; // Le PDV reçoit l'argent retiré
                await utilisateur.save();

                console.log("Retrait effectué avec succès.");
                return res.status(201).json({
                    message: "Retrait ajouté avec succès.",
                });
            } else {
                // console.log("Solde utilisateur insuffisant :", utilisateur.solde);
                return res.status(400).json({ message: `Solde insuffisant: ` + utilisateur.solde });
            }

        } else {
            console.log("Type invalide :", type);
            return res.status(400).json({ message: "Type invalide." });
        }

    } catch (error) {
        console.error("Erreur lors de l'ajout :", error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
};



const validerOrangeMoney = async (req, res) => {
    try {
        const { reference } = req.params; // Récupération du code depuis l'URL
        const { utilisateurId } = req.body;

        // Vérifier si la sortie existe en fonction du code
        const orangeMoney = await OrangeMoney.findOne({ where: { reference } });
        if (!orangeMoney) {
            return res.status(404).json({ message: "Code non trouvée." });
        }

        // Vérifier si l'utilisateur existe
        const utilisateur = await Utilisateur.findByPk(utilisateurId);
        if (!utilisateur) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        // Vérification de l'état de la sortie
        if (orangeMoney.status === "VALIDER") {
            return res.status(400).json({ message: "Cet depot ou rretrait est déjà VALIDER." });
        }

        if (orangeMoney.status === "ANNULEE") {
            return res
                .status(400)
                .json({ message: "Impossible de valider une sortie ANNULÉE." });
        }

        if (orangeMoney.type === "RETRAIT") {
            utilisateur.solde -= orangeMoney.montant;
            orangeMoney.status = "VALIDER";
            await utilisateur.save();
            await orangeMoney.save();
            res.status(200).json({
                message: "Retrait validée avec succès.",
            });
        } else if (orangeMoney.type === "DEPOT") {
            utilisateur.solde += orangeMoney.montant;
            orangeMoney.status = "VALIDER";
            await orangeMoney.save();
            await utilisateur.save();

            res.status(200).json({
                message: "Depot validée avec succès.",
            });
        }
    } catch (error) {
        console.error("Erreur lors de la validation de la sortie :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};


const recupererOrangeMoney = async (req, res) => {
    try {
        // Récupérer tous les partenaires avec les informations de l'utilisateur associé
        const orangeMoney = await OrangeMoney.findAll({
            include: [
                {
                    model: Utilisateur,
                    attributes: ["id", "nom", "prenom", "email"], // Vous pouvez spécifier les attributs que vous voulez afficher
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        // Si aucun partenaire n'est trouvé
        if (orangeMoney.length === 0) {
            return res.status(404).json({ message: "Aucun credit trouvé." });
        }

        res.status(200).json(orangeMoney);
    } catch (error) {
        console.error("Erreur lors de la récupération des credit :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};


module.exports = { recupererOrangeMoney, ajouterDepotRetrait, validerOrangeMoney };
