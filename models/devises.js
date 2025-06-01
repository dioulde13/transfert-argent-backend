const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Utilisateur = require('./utilisateurs'); 


const Devise = sequelize.define('Devise', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true, // Un seul champ peut être la clé primaire
  },
  utilisateurId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Ou true si facultatif
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Définit la date et l'heure actuelles par défaut
  },
  paysDepart: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paysArriver: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  signe_1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  signe_2: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prix_1: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  prix_2: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

// Définir l'association : Une Entree appartient à un 
Devise.belongsTo(Utilisateur, { foreignKey: 'utilisateurId' });

module.exports = Devise;
