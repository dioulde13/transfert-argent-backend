const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");
const Utilisateur = require("./utilisateurs");
const Partenaire = require("./partenaires");
const Devise = require("./devises");

const Sortie = sequelize.define("Sortie", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  utilisateurId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Ou true si facultatif
  },
  partenaireId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Ou true si facultatif
  },
  deviseId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Ou true si facultatif
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  codeEnvoyer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  prix_1: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  prix_2: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  signe_1: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 0,
  },
  signe_2: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 0,
  },
  pays_exp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pays_dest: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Guinée",
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Définit la date et l'heure actuelles par défaut
  },
  expediteur: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  receveur: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nomCLient: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  montantClient: {
    type: DataTypes.BIGINT,
    allowNull: true,
    defaultValue: 0,
  },
  montant: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  montant_gnf: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  montant_payer: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  montant_restant: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  telephone_receveur: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  payement_type: {
    type: DataTypes.ENUM("COMPLET", "NON COMPLET"),
    allowNull: false,
    defaultValue: "NON COMPLET",  
  },
  status: {
    type: DataTypes.ENUM("NON PAYEE", "PAYEE", "EN COURS", "ANNULEE"),
    allowNull: false,
    defaultValue: "NON PAYEE", 
  },
  type: {
    type: DataTypes.ENUM("R", "NON R"),
    allowNull: false,
    defaultValue: "NON R",
  },
});

Sortie.belongsTo(Utilisateur, { foreignKey: "utilisateurId" });

Sortie.belongsTo(Partenaire, { foreignKey: "partenaireId" });

Sortie.belongsTo(Devise, { foreignKey: "deviseId" });

module.exports = Sortie;
