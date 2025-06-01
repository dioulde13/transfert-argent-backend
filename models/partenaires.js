const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Utilisateur = require('./utilisateurs'); // Assurez-vous d'importer le modèle Utilisateur

const Partenaire = sequelize.define('Partenaire', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  utilisateurId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pays: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  montant_preter: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  montant_credit: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  montant_credit_dollar: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  montant_credit_euro: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('CODE', 'ECHANGE'),
    allowNull: false,
    defaultValue: 'CODE', 
  },
  type: {
    type: DataTypes.ENUM('NON PAYEE', 'PAYEE'),
    allowNull: false,
    defaultValue: 'NON PAYEE', 
  },
});

// Définir l'association : Un partenaire appartient à un utilisateur
Partenaire.belongsTo(Utilisateur, { foreignKey: 'utilisateurId' });

module.exports = Partenaire;
