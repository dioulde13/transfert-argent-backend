const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Utilisateur = require('./utilisateurs');
const Partenaire = require('./partenaires');
// const Devise = require('./devises');


const Rembourser = sequelize.define('Rembourser', {
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
    allowNull: false,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prix: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  montant: {
    type: DataTypes.BIGINT,
    allowNull: false, 
  },
  montant_gnf: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, 
  },
  type: {
    type: DataTypes.ENUM("R", "NON R"),
    allowNull: false,
    defaultValue: "NON R",
  },
});


Rembourser.belongsTo(Utilisateur, { foreignKey: 'utilisateurId' });

Rembourser.belongsTo(Partenaire, { foreignKey: 'partenaireId' });


module.exports = Rembourser;
