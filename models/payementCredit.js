const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Utilisateur = require('./utilisateurs');
const Credit = require('./credit'); 


const PayementCreadit = sequelize.define('PayementCreadit', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  utilisateurId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  creditId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false, // Ou true si facultatif
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  montant: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  }
});

// Définir l'association : Un Credit appartient à un utilisateur  
PayementCreadit.belongsTo(Utilisateur, { foreignKey: 'utilisateurId' });
PayementCreadit.belongsTo(Credit, { foreignKey: 'creditId' });

module.exports = PayementCreadit;
