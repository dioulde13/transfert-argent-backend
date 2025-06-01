const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");
const Utilisateur = require("./utilisateurs");
const Devise = require("./devises");
const Partenaire = require("./partenaires");

const Echange = sequelize.define("Echange", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  partenaireId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Ou true si facultatif
  },
  utilisateurId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Ou true si facultatif
    defaultValue: 0,
  },
  deviseId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Ou true si facultatif
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  montant_devise: {
    type: DataTypes.BIGINT,
    allowNull: false, // Ajout de la contrainte pour montant
  },
  montant_gnf: {
    type: DataTypes.BIGINT,
    allowNull: false, // Ajout de la contrainte pour montant
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
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Définit la date et l'heure actuelles par défaut
  },
});

Echange.belongsTo(Partenaire, { foreignKey: "utilisateurId" });

// Définir l'association : Une Entree appartient à un
Echange.belongsTo(Utilisateur, { foreignKey: "utilisateurId" });

// Définir l'association : Une Entree appartient à un
Echange.belongsTo(Devise, { foreignKey: "deviseId" });

module.exports = Echange;
