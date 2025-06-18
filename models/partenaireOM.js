const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Utilisateur = require('./utilisateurs'); 

const PartenaireOM = sequelize.define('PartenaireOM', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  utilisateurId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // reference: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  // date_creation: {
  //   type: DataTypes.DATE,
  //   allowNull: false,
  //   defaultValue: DataTypes.NOW,
  // },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  montant: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  // type: {
  //   type: DataTypes.ENUM('NON PAYEE', 'EN COURS', 'PAYEE'),
  //   allowNull: false,
  //   defaultValue: 'NON PAYEE', 
  // },
});

PartenaireOM.belongsTo(Utilisateur, { foreignKey: 'utilisateurId' });

module.exports = PartenaireOM;
