const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Utilisateur = require('./utilisateurs'); // Assurez-vous d'importer le modèle Utilisateur

const Credit = sequelize.define('Credit', {
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
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  montant: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  montantPaye: { 
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  }, // Nouveau champ
  montantRestant: { 
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  },
  type: {
    type: DataTypes.ENUM("ENTRE", "SORTIE", "ANNULEE"),
    allowNull: false,
    defaultValue: "SORTIE", 
  }
});

// Définir l'association : Un Credit appartient à un utilisateur
Credit.belongsTo(Utilisateur, { foreignKey: 'utilisateurId' });

module.exports = Credit;
