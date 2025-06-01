const bcrypt = require('bcrypt');
const Utilisateur = require('../models/utilisateurs');

const sequelize = require('../models/sequelize');

// Ajouter un utilisateur
exports.ajouterUtilisateur = async (req, res) => {
  try {
    const { nom, prenom, telephone, email, password, role } = req.body;

    if (!nom || !prenom || !telephone || !email || !password || !role) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const utilisateur = await Utilisateur.create({
      nom,
      prenom,
      telephone,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès.',
      utilisateur,
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

// Récupérer la liste des utilisateurs
exports.recupererUtilisateurs = async (req, res) => {
    try {
      const utilisateurs = await Utilisateur.findAll();
  
      res.status(200).json({
        message: 'Liste des utilisateurs récupérée avec succès.',
        utilisateurs,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs :', error);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  };

  // Récupérer la liste des utilisateurs avec une requête SQL brute
exports.recupererUtilisateursAvecRequete = async (req, res) => {
    try {
      const [utilisateurs] = await sequelize.query('SELECT * FROM Utilisateurs');
  
      res.status(200).json({
        message: 'Liste des utilisateurs récupérée avec succès.',
        utilisateurs,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs :', error);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  };
  