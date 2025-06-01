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
    defaultValue: DataTypes.NOW, // Définit la date et l'heure actuelles par défaut
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // sign: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  // sign_dollar: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  // sign_euro: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  telephone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  solde: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
   autre_solde: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  encien_solde: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  // solde_echange: {
  //   type: DataTypes.BIGINT,
  //   allowNull: false,
  //   defaultValue: 0,
  // },
  // solde_echange_dollar: {
  //   type: DataTypes.BIGINT,
  //   allowNull: false,
  //   defaultValue: 0,
  // },
  // solde_echange_euro: {
  //   type: DataTypes.BIGINT,
  //   allowNull: false,
  //   defaultValue: 0,
  // },
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
    defaultValue: 'ADMIN', // Définir une valeur par défaut
  },
  btEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false, // Indique que la valeur ne peut pas être nulle
    defaultValue: true, // Vous pouvez définir une valeur par défaut (true ou false)
  },
});

module.exports = Utilisateur;
