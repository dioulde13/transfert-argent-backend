const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Utilisateur = require('./utilisateurs');
const Partenaire = require("./partenaires");

const CreancierPartenaire = sequelize.define('CreancierPartenaire', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  utilisateurId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  partenaireId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Ou true si facultatif
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
});

// Définir l'association : Un Depense appartient à un utilisateur
CreancierPartenaire.belongsTo(Utilisateur, { foreignKey: 'utilisateurId' });

CreancierPartenaire.belongsTo(Partenaire, { foreignKey: "partenaireId" });

module.exports = CreancierPartenaire;
