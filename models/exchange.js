const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Utilisateur = require('./utilisateurs');

const Exchange = sequelize.define('Exchange', {
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
  montant: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  prix: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  signOne: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  signTwo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Définir l'association : Un Depense appartient à un utilisateur
Exchange.belongsTo(Utilisateur, { foreignKey: 'utilisateurId' });

module.exports = Exchange;
