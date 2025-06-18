const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Utilisateur = require('./utilisateurs'); // Assurez-vous d'importer le modèle Utilisateur

const OrangeMoney = sequelize.define('OrangeMoney', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  utilisateurId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  montant: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  type: {
    type: DataTypes.ENUM('DEPOT', 'RETRAIT'),
    allowNull: false,
    defaultValue: 'DEPOT', 
  },
  status: {
    type: DataTypes.ENUM('NON VALIDER', 'VALIDER', 'ANNULEE'),
    allowNull: false,
    defaultValue: 'NON VALIDER', 
  },
});


OrangeMoney.belongsTo(Utilisateur, { foreignKey: 'utilisateurId' });

module.exports = OrangeMoney;
