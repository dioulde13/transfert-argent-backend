const Exchange = require("../models/exchange");
const Utilisateur = require("../models/utilisateurs");

const ajouterExchange = async (req, res) => {
    try {
        const { utilisateurId, date_creation, montant, prix, signOne, signTwo } = req.body;

        if (!utilisateurId || !date_creation || !montant || !prix || !signOne || !signTwo) {
            return res
                .status(400)
                .json({ message: "Tous les champs sont obligatoires." });
        }

        const utilisateur = await Utilisateur.findByPk(utilisateurId);
        if (!utilisateur) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }


        const exchange = await Exchange.create({
            utilisateurId,
            date_creation,
            montant,
            prix,
            signOne,
            signTwo
        });

        let soldeTotal;
        if (signOne === 'USD' && signTwo === 'GNF') {
            if (utilisateur.soldePayerAvecCodeDolar > 0) {
                soldeTotal = montant * prix / 100;
                utilisateur.solde += soldeTotal;
                utilisateur.soldePayerAvecCodeDolar -= montant;
            } else {
                return res.status(404).json({ message: "Solde insufissant." });
            }
        } else if (signOne === "XOF" && signTwo === "GNF") {
            if (utilisateur.soldePayerAvecCodeXOF > 0) {
                soldeTotal = montant * prix / 5000;
                utilisateur.solde += soldeTotal;
                utilisateur.soldePayerAvecCodeXOF -= montant;
            } else {
                return res.status(404).json({ message: "Solde insufissant." });
            }
        } else if (signOne === 'EURO' && signTwo === 'GNF') {
            if (utilisateur.soldePayerAvecCodeEuro > 0) {
                soldeTotal = montant * prix / 100;
                utilisateur.solde += soldeTotal;
                utilisateur.soldePayerAvecCodeEuro -= montant;
            } else {
                return res.status(404).json({ message: "Solde insufissant." });
            }
        } else if (signOne === "GNF" && signTwo === "XOF") {
            if (utilisateur.solde > 0) {
                soldeTotal = montant / prix * 5000;
                utilisateur.solde -= montant;
                utilisateur.soldePayerAvecCodeXOF += soldeTotal;
            } else {
                return res.status(404).json({ message: "Solde insufissant." });
            }
        } else if (signOne === "GNF" && signTwo === "EURO") {
            if (utilisateur.solde > 0) {
                soldeTotal = montant / prix * 100;
                utilisateur.solde -= soldeTotal;
                utilisateur.soldePayerAvecCodeEuro += montant;
            } else {
                return res.status(404).json({ message: "Solde insufissant." });
            }
        } else if (signOne === "GNF" && signTwo === "USD") {
            if (utilisateur.solde > 0) {
                soldeTotal = montant / prix * 100;
                utilisateur.solde -= montant;
                utilisateur.soldePayerAvecCodeDolar += soldeTotal;
            } else {
                return res.status(404).json({ message: "Solde insufissant." });
            }
        }
        await utilisateur.save();
        res.status(201).json({
            message: "Exchange ajouté avec succès.",
            exchange,
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout d'exchange :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};



const recupererExchange = async (req, res) => {
    try {
        const exchange = await Exchange.findAll({
            include: [
                {
                    model: Utilisateur,
                    attributes: ["id", "nom", "prenom", "email"],
                },
            ],
        });

        if (exchange.length === 0) {
            return res.status(404).json({ message: "Aucun exchange trouvé." });
        }

        res.status(200).json(exchange);
    } catch (error) {
        console.error("Erreur lors de la récupération d'exchange :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};


module.exports = { ajouterExchange, recupererExchange };
