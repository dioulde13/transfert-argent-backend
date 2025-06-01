const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Utilisateur = require('./utilisateurs'); 
const Echange = require('./echanger'); 

const PayementEchange = sequelize.define('PayementEchange', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  utilisateurId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Ou true si facultatif
  },
  echangeId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Ou true si facultatif
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false, // Ou true si facultatif
  },
  montant: {
    type: DataTypes.BIGINT,
    allowNull: false, // Ajout de la contrainte pour montant
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Définit la date et l'heure actuelles par défaut
  },
});

// Définir l'association : Une Entree appartient à un 
PayementEchange.belongsTo(Utilisateur, { foreignKey: 'utilisateurId' });
// Définir l'association : Une Entree appartient à un 
PayementEchange.belongsTo(Echange, { foreignKey: 'echangeId' });

module.exports = PayementEchange;
