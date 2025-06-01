const VerifierCaisse = require('../models/verifierCaisse');
const Utilisateur = require('../models/utilisateurs');
const { Op } = require('sequelize');  // Assurez-vous d'importer Op de Sequelize
const { Sequelize } = require('sequelize');



const ajouterCaisse = async (req, res) => {
  try {
    const { utilisateurId, prix_dollar, prix_euro, solde_cfa, prix_cfa, solde_dollars, solde_euro, solde_gnf } = req.body;

    // Vérifier si tous les champs nécessaires sont fournis
    if (!utilisateurId || !prix_dollar || !prix_euro || !solde_cfa || !prix_cfa || !solde_dollars || !solde_euro || !solde_gnf) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }


    // Créer un nouveau partenaire
    const caisse = await VerifierCaisse.create({
      utilisateurId,
      solde_dollars,
      solde_euro,
      solde_cfa,
      solde_gnf,
      prix_dollar,
      prix_euro,
      solde_cfa,
      prix_cfa
    });

    res.status(201).json({
      message: 'Caisse ajouté avec succès.',
      caisse,
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du partenaire :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

const listeCaisse = async (req, res) => {
  try {
    // Récupérer tous les partenaires avec les informations de l'utilisateur associé
    const verifiercaisse = await VerifierCaisse.findAll(
      {
        include: [
          {
            model: Utilisateur,
            attributes: ['id', 'nom', 'prenom', 'email'], // Vous pouvez spécifier les attributs que vous voulez afficher
          },
        ],
      order: [['date_creation', 'DESC']]
      }
    );

    // Si aucun partenaire n'est trouvé
    if (verifiercaisse.length === 0) {
      return res.status(404).json({ message: 'Aucun casise trouvé.' });
    }

    res.status(200).json(verifiercaisse);
  } catch (error) {
    console.error('Erreur lors de la récupération des caisse :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

const listeCaisseParJour = async (req, res) => {
  try {
    // Récupérer la date du jour au format YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // Récupérer toutes les caisses créées aujourd'hui
    const verifiercaisse = await VerifierCaisse.findAll({
      where: {
        date_creation: {
          [Op.gte]: new Date(today + 'T00:00:00.000Z'), // Début de la journée
          [Op.lt]: new Date(today + 'T23:59:59.999Z'), // Fin de la journée
        },
      },
      order: [[Sequelize.fn('DATE', Sequelize.col('VerifierCaisse.date_creation')), 'DESC']], // Trier par date
    });

    // Si aucun enregistrement n'est trouvé
    if (verifiercaisse.length === 0) {
      return res.status(404).json({ message: 'Aucune caisse trouvée pour aujourd\'hui.' });
    }

    res.status(200).json(verifiercaisse);
  } catch (error) {
    console.error('Erreur lors de la récupération des caisses :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};


module.exports = { ajouterCaisse, listeCaisse, listeCaisseParJour };
