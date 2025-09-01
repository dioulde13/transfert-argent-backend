const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Utilisateur = sequelize.define('Utilisateur', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
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
  telephone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  solde: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  soldePDV: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  soldeXOF: {
    type: DataTypes.BIGINT,
    allowNull: true,
    defaultValue: 0,  
  },
   soldePayerAvecCodeXOF: {
    type: DataTypes.BIGINT,
    allowNull: true,
    defaultValue: 0, 
  },
    soldePayerAvecCodeDolar: {
    type: DataTypes.BIGINT,
    allowNull: true,
    defaultValue: 0, 
  },
    soldePayerAvecCodeEuro: {
    type: DataTypes.BIGINT,
    allowNull: true,
    defaultValue: 0, 
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'UTILISATEUR'),
    allowNull: false,
    defaultValue: 'ADMIN',
  },
  btEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

module.exports = Utilisateur;
