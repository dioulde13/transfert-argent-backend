const express = require('express');
const app = express();
app.use(express.json());
const { Op } = require('sequelize');
const Entre = require('../models/entres');       // Entrées d'argent
const Sortie = require('../models/sorties');     // Sorties d'argent
const Rembourser = require('../models/rembourser'); // Remboursements

const calculBeneficeAuthomatique = async (req, res) => {
  try {
    const { date_debut, date_fin } = req.query;

    if (!date_debut || !date_fin) {
      return res.status(400).json({ message: "Les dates de début et de fin sont requises." });
    }

    // Convertir les chaînes en objets Date
    const debut = new Date(date_debut + 'T00:00:00');
    const fin = new Date(date_fin + 'T23:59:59');

    let totalMontantEntreGnf = 0;
    let totalMontantEntreXof = 0;
    let totalMontantSortieGnf = 0;
    let totalMontantSortieXof = 0;
    let totalMontantRembourserGnf = 0;
    let totalMontantRembourserXof = 0;
    let totalMontantSortieRembourserGnf = 0;
    let totalMontantSortieRembourserXof = 0;

    const entreData = await Entre.findAll({
      where: {
        status: { [Op.ne]: 'ANNULEE' },
        type: 'R',
        createdAt: {
          [Op.between]: [debut, fin]
        }
      }
    });

    entreData.forEach(entry => {
      totalMontantEntreXof +=entry.montant_cfa
      totalMontantEntreGnf += entry.montant_gnf;
    });

    const sortieData = await Sortie.findAll({
      where: {
        status: { [Op.ne]: 'ANNULEE' },
        type: 'R',
        createdAt: {
          [Op.between]: [debut, fin]
        }
      }
    });

    sortieData.forEach(sortie => {
      totalMontantSortieXof +=sortie.montant
      totalMontantSortieGnf += sortie.montant_gnf;
    });

    const remboursementData = await Rembourser.findAll({
      where: {
        type: 'R',
        createdAt: {
          [Op.between]: [debut, fin]
        }
      }
    });

    remboursementData.forEach(remb => {
      totalMontantRembourserXof +=remb.montant
      totalMontantRembourserGnf += remb.montant_gnf;
    });

    totalMontantSortieRembourserXof = totalMontantSortieXof + totalMontantRembourserXof;

     totalMontantSortieRembourserGnf = totalMontantSortieGnf + totalMontantRembourserGnf;

    const benefice = totalMontantEntreGnf - totalMontantSortieRembourserGnf;

    return res.json({
      totalMontantEntreGnf,
      totalMontantEntreXof,
      totalMontantSortieGnf,
      totalMontantSortieXof,
      totalMontantRembourserGnf,
      totalMontantRembourserXof,
      totalMontantSortieRembourserGnf,
      totalMontantSortieRembourserXof,
      benefice,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

const calculBenefice = async (req, res) => {
  const { dateDebut, dateFin, montant, prix_1, prix } = req.body;

  if (!dateDebut || !dateFin) {
    return res.status(400).json({ message: 'Tous les paramètres sont requis.' });
  }

  try {
    // Convertir les dates en format Date
    const startDate = new Date(dateDebut);
    const endDate = new Date(dateFin);

    // Calculer le montant total en CFA et en GNF
    let totalMontantCfa = 0;
    let totalMontantGnf = 0;

    const entreData = await Entre.findAll({
      where: {
        date_creation: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    entreData.forEach(entry => {
      if (entry.status !== 'ANNULEE' && entry.type !== 'R') {
          totalMontantCfa += entry.montant_cfa;
          totalMontantGnf += entry.montant_gnf;
      }
    });

    // Calcul du montant total en GNF pour le montant CFA saisi par l'utilisateur en utilisant prix_1
    const montantGnfSaisi = (montant / prix_1) * prix;

    return res.json({
      totalMontantCfa,
      totalMontantGnf,
      montantGnfSaisi,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

module.exports = { calculBenefice , calculBeneficeAuthomatique};

