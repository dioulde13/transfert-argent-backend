const { Op } = require('sequelize');
const Entre = require('../models/entres');
const Rembourser = require('../models/rembourser');

const donneBenefice = async (req, res) => {
    try {
        const { dateDebut, dateFin } = req.query;
    
        if (!dateDebut || !dateFin) {
          return res.status(400).json({ message: "Veuillez fournir les dates 'dateDebut' et 'dateFin'." });
        }
    
        // 🔍 Récupérer les ventes (Entre) et les achats (Rembourser) entre les deux dates
        const ventes = await Entre.findAll({
          where: {
            date_creation: {
              [Op.between]: [new Date(dateDebut), new Date(dateFin)],
            },
          },
        });
    
        const achats = await Rembourser.findAll({
          where: {
            date_creation: {
              [Op.between]: [new Date(dateDebut), new Date(dateFin)],
            },
          },
        });
    
        // 💰 Calcul du montant total des ventes et des achats
        const totalVentes = ventes.reduce((acc, vente) => acc + vente.montant_gnf, 0);
        const totalAchats = achats.reduce((acc, achat) => acc + achat.montant_gnf, 0);
    
        const benefice = totalVentes - totalAchats;
    
        res.json({
          dateDebut,
          dateFin,
          totalVentes,
          totalAchats,
          benefice,
          resultat: benefice >= 0 ? "Bénéfice" : "Perte",
        });
      } catch (error) {
        console.error("Erreur lors du calcul du bénéfice :", error);
        res.status(500).json({ message: "Erreur serveur" });
      }
};

module.exports = { donneBenefice};
