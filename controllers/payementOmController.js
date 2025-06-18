const OrangeMoney = require("../models/orangeMoney");
const PayementOM = require("../models/payementOM");
const Utilisateur = require("../models/utilisateurs");


const recupererPayementOM = async (req, res) => {
    try {
        const payementOM = await PayementOM.findAll({
            include: [
                {
                    model: Utilisateur,
                    attributes: ["id", "nom", "prenom", "email"], 
                },
                 {
                    model: OrangeMoney,
                    attributes: ["id"], 
                },
            ],
            order: [["date_creation", "DESC"]],
        });

        if (payementOM.length === 0) {
            return res.status(404).json({ message: "Aucun credit trouvé." });
        }

        res.status(200).json(payementOM);
    } catch (error) {
        console.error("Erreur lors de la récupération des credit :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};


module.exports = { recupererPayementOM };
