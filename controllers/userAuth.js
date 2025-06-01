const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Utilisateur = require("../models/utilisateurs");
const { ValidationError } = require("sequelize");

// Clé secrète JWT
const JWT_SECRET = "votre_clé_secrète_pour_jwt";

// Récupérer les informations de l'utilisateur connecté
const getUserInfo = async (req, res) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token manquant ou invalide.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Récupérer l'utilisateur à partir de l'ID présent dans le token
    const utilisateur = await Utilisateur.findOne({
      where: { id: decoded.id },
      attributes: { exclude: ["password"] }, // Exclure le mot de passe pour des raisons de sécurité
    });

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé.",
      });
    }

    // Retourner les informations de l'utilisateur
    res.status(200).json({
      success: true,
      user: utilisateur,
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token invalide.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des informations utilisateur.",
      error: err.message,
    });
  }
};

const modifier = async (req, res) => {
  const { id } = req.params;
  const {
    nom,
    solde,
    sign,
    prenom,
    telephone,
    email,
    sign_dollar,
    sign_euro,
    encien_solde,
    solde_echange,
    solde_echange_dollar,
    solde_echange_euro,
  } = req.body;

  try {
    // Trouver l'utilisateur par ID
    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Mettre à jour les informations de l'utilisateur
    await utilisateur.update({
      nom,
      solde,
      sign,
      prenom,
      telephone,
      email,
      sign_dollar,
      sign_euro,
      encien_solde,
      solde_echange,
      solde_echange_dollar,
      solde_echange_euro,
    });

    return res
      .status(200)
      .json({ message: "Utilisateur mis à jour avec succès", utilisateur });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de la mise à jour de l'utilisateur",
      error,
    });
  }
};

const rechargerSolde = async (req, res) => {
  try {
    const { utilisateurId, montant } = req.body;

    // Vérification des entrées
    if (!utilisateurId || !montant || isNaN(montant) || montant <= 0) {
      return res.status(400).json({ message: "Montant invalide" });
    }

    // Recherche de l'utilisateur
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Mise à jour du solde
    utilisateur.solde += parseFloat(montant);
    await utilisateur.save(); // Enregistrement dans la base de données

    return res.json({
      message: "Solde rechargé avec succès",
      solde: utilisateur.solde,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de la mise à jour du solde",
      error: error.message,
    });
  }
};

const ajouterUtilisateur = async (req, res) => {
  try {
    const {
      nom,
      prenom,
      telephone,
      email,
      // sign,
      // sign_dollar,
      // sign_euro,
      password,
    } = req.body;

    // Validation des champs
    if (
      !nom ||
      !prenom ||
      !telephone ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Les champs nom, prénom, numéro de téléphone, email, mot de passe sont requis.",
      });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un utilisateur dans la base de données
    const utilisateur = await Utilisateur.create({
      nom,
      prenom,
      telephone,
      email, 
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Utilisateur ajouté avec succès.",
      userId: utilisateur.id,
    });
  } catch (err) {
    console.error("Erreur lors de l'ajout de l'utilisateur :", err);
    if (err instanceof ValidationError) {
      res.status(400).json({
        success: false,
        message: "Erreur de validation des données.",
        error: err.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'ajout de l'utilisateur.",
        error: err.message,
      });
    }
  }
};

const getAllUser = async (req, res) => {
  try {
    // Récupérer toutes les devises
    const utilisateurs = await Utilisateur.findAll();
    // Si aucune devise n'est trouvée
    if (utilisateurs.length === 0) {
      return res.status(404).json({ message: "Aucune utilisateurs trouvée." });
    }

    res.status(200).json(utilisateurs);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Connexion de l'utilisateur
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des champs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis.",
      });
    }

    // Rechercher l'utilisateur dans la base de données
    const utilisateur = await Utilisateur.findOne({
      where: { email },
    });

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé.",
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(
      password,
      utilisateur.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Mot de passe incorrect.",
      });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: utilisateur.id, email: utilisateur.email, role: utilisateur.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Retourner le token et les informations de l'utilisateur
    res.json({
      success: true,
      message: "Connexion réussie.",
      token,
      user: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        telephone: utilisateur.telephone,
        solde: utilisateur.solde,
        role: utilisateur.role,
        btEnabled: utilisateur.btEnabled,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion.",
      error: err.message,
    });
  }
};

module.exports = {
  ajouterUtilisateur,
  login,
  getAllUser,
  getUserInfo,
  modifier,
  rechargerSolde,
};
