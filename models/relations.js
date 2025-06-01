const Devise = require("./devises");
const Echange = require("./echanger");
const PayementEchange = require("./payementEchange");
const Entre = require("./entres");
const Sortie = require("./sorties");
const Partenaire = require("./partenaires");
const VerifierCaisse = require("./verifierCaisse");
const Utilisateur = require("./utilisateurs");
const Rembourser = require("./rembourser");
const Payement = require("./payement");
const Depense = require("./depense");
const Credit = require("./credit");
const PayementCreadit = require("./payementCredit");

// Relation One-to-Many : Un Partenaire peut avoir plusieurs Entres
Partenaire.hasMany(Entre, { foreignKey: "partenaireId" });
Entre.belongsTo(Partenaire, { foreignKey: "partenaireId" });

// Relation One-to-Many : Un Payement peut avoir plusieurs sorties
Payement.hasMany(Sortie, { foreignKey: "payementId" });
Sortie.belongsTo(Payement, { foreignKey: "payementId" });
// Relation One-to-Many : Un Payement peut avoir plusieurs Entres
Payement.hasMany(Entre, { foreignKey: "payementId" });
Entre.belongsTo(Payement, { foreignKey: "payementId" });

// Relation One-to-Many : Un Payement peut avoir plusieurs Entres
PayementCreadit.hasMany(Credit, { foreignKey: "payementCreditId" });
Credit.belongsTo(PayementCreadit, { foreignKey: "payementCreditId" });

PayementEchange.hasMany(Echange, { foreignKey: "payementEchangeId" });
Echange.belongsTo(PayementEchange, { foreignKey: "payementEchangeId" });

Partenaire.hasMany(Echange, { foreignKey: "partenaireId" });
Echange.belongsTo(Partenaire, { foreignKey: "partenaireId" });

// Relation One-to-Many : Un Partenaire peut avoir plusieurs Sorties
Partenaire.hasMany(Sortie, { foreignKey: "partenaireId" });
Sortie.belongsTo(Partenaire, { foreignKey: "partenaireId" });

Utilisateur.hasMany(Partenaire, { foreignKey: "utilisateurId" });
Partenaire.belongsTo(Utilisateur, { foreignKey: "utilisateurId" });

// Relation One-to-Many : Un Devise peut avoir plusieurs Entres
Devise.hasMany(Entre, { foreignKey: "deviseId" });
Entre.belongsTo(Devise, { foreignKey: "deviseId" });

// Relation One-to-Many : Un Devise peut avoir plusieurs Sorties
Devise.hasMany(Sortie, { foreignKey: "deviseId" });
Sortie.belongsTo(Devise, { foreignKey: "deviseId" });

// Relation One-to-Many : Un Devise peut avoir plusieurs Échanges
Devise.hasMany(Echange, { foreignKey: "deviseId" });
Echange.belongsTo(Devise, { foreignKey: "deviseId" });

// Relation One-to-Many : Un Partenaire peut avoir plusieurs Remboursements
Partenaire.hasMany(Rembourser, { foreignKey: "partenaireId" });
Rembourser.belongsTo(Partenaire, { foreignKey: "partenaireId" });

// Relation One-to-Many : Un Utilisateur peut avoir plusieurs Entres
Utilisateur.hasMany(Entre, { foreignKey: "utilisateurId" });
Entre.belongsTo(Utilisateur, { foreignKey: "utilisateurId" });

// Relation One-to-Many : Un Utilisateur peut avoir plusieurs Sorties
Utilisateur.hasMany(Sortie, { foreignKey: "utilisateurId" });
Sortie.belongsTo(Utilisateur, { foreignKey: "utilisateurId" });

// Relation One-to-Many : Un Utilisateur peut avoir plusieurs Sorties
Utilisateur.hasMany(VerifierCaisse, { foreignKey: "utilisateurId" });
VerifierCaisse.belongsTo(Utilisateur, { foreignKey: "utilisateurId" });

// Relation One-to-Many : Un Utilisateur peut avoir plusieurs Échanges
Utilisateur.hasMany(Echange, { foreignKey: "utilisateurId" });
Echange.belongsTo(Utilisateur, { foreignKey: "utilisateurId" });

// Relation One-to-Many : Un Utilisateur peut avoir plusieurs Échanges
Utilisateur.hasMany(PayementEchange, { foreignKey: "utilisateurId" });
PayementEchange.belongsTo(Utilisateur, { foreignKey: "utilisateurId" });

// Relation One-to-Many : Un Utilisateur peut avoir plusieurs Remboursements
Utilisateur.hasMany(Rembourser, { foreignKey: "utilisateurId" });
Rembourser.belongsTo(Utilisateur, { foreignKey: "utilisateurId" });

// Relation One-to-Many : Un Devise peut avoir plusieurs Entres
// Devise.hasMany(Rembourser, { foreignKey: "deviseId" });
// Rembourser.belongsTo(Devise, { foreignKey: "deviseId" });

// Relation One-to-Many : Un Utilisateur peut avoir plusieurs Entres
Utilisateur.hasMany(Depense, { foreignKey: "utilisateurId" });
Depense.belongsTo(Utilisateur, { foreignKey: "utilisateurId" });

// Relation One-to-Many : Un Utilisateur peut avoir plusieurs Entres
Utilisateur.hasMany(Credit, { foreignKey: "utilisateurId" });
Credit.belongsTo(Utilisateur, { foreignKey: "utilisateurId" });

module.exports = {
  Devise,
  Credit,
  Echange,
  Payement,
  Depense,
  Entre,
  Sortie,
  Partenaire,
  Utilisateur,
  Rembourser,
};
