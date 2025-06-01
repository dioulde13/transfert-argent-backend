const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Utilisateur = require('./utilisateurs'); 

const VerifierCaisse = sequelize.define('VerifierCaisse', {
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
  solde_dollars: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  prix_dollar: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  solde_euro: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  prix_euro: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  solde_cfa: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  prix_cfa: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  solde_gnf: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  montant_total: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  }
});

// Définir l'association : Un partenaire appartient à un utilisateur
VerifierCaisse.belongsTo(Utilisateur, { foreignKey: 'utilisateurId' });

module.exports = VerifierCaisse;
