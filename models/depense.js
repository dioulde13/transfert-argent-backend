const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Utilisateur = require('./utilisateurs'); // Assurez-vous d'importer le modèle Utilisateur

const Depense = sequelize.define('Depense', {
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
  motif: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  montant: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
});

// Définir l'association : Un Depense appartient à un utilisateur
Depense.belongsTo(Utilisateur, { foreignKey: 'utilisateurId' });

module.exports = Depense;
