const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");
const Utilisateur = require("./utilisateurs");
const Entre = require("./entres");
const Sortie = require("./sorties");

const Payement = sequelize.define("Payement", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  utilisateurId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Ou true si facultatif
  },
  entreId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Ou true si facultatif
  },
  sortieId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Ou true si facultatif
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false, // Ou true si facultatif
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
  prix: {
    type: DataTypes.BIGINT,
    allowNull: true,
    defaultValue: 0,
  },
  signe: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM("ENTREE", "SORTIE"),
    allowNull: false,
    defaultValue: "ENTREE",
  },
});

// Définir l'association : Une Entree appartient à un
Payement.belongsTo(Utilisateur, { foreignKey: "utilisateurId" });
// Définir l'association : Une Entree appartient à un
Payement.belongsTo(Entre, { foreignKey: "entreId" });

Payement.belongsTo(Sortie, { foreignKey: "sortieId" });

module.exports = Payement;
