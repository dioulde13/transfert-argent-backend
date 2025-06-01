const Entre = require("../models/entres");
const Utilisateur = require("../models/utilisateurs");
const Partenaire = require("../models/partenaires");
const Devise = require("../models/devises");
const { Sequelize } = require("sequelize");

// Récupérer les entrées avec les associations
const recupererEntreesAvecAssocies = async (req, res) => {
  try {
    const entrees = await Entre.findAll({
      include: [
        {
          model: Utilisateur,
          attributes: ["id", "nom", "prenom", "email", "solde"], // Champs nécessaires de l'utilisateur
        },
        {
          model: Partenaire,
          attributes: ["id", "nom", "prenom", "montant_preter"], // Champs nécessaires du partenaire
        },
        {
          model: Devise,
          attributes: [
            "id",
            "paysDepart",
            "paysArriver",
            "signe_1",
            "signe_2",
            "prix_1",
            "prix_2",
          ], // Champs nécessaires de la devise
        },
      ],
      order: [["date_creation", "DESC"]],
    });

    if (entrees.length === 0) {
      return res.status(404).json({ message: "Aucune entrée trouvée." });
    }

    res.status(200).json(entrees);
  } catch (error) {
    console.error("Erreur lors de la récupération des entrées :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Ajouter une entrée
const ajouterEntre = async (req, res) => {
  try {
    const {
      utilisateurId,
      partenaireId,
      deviseId,
      expediteur,
      receveur,
      montant_cfa,
      montant,
      telephone_receveur,
    } = req.body;

    // Vérifier si tous les champs obligatoires sont présents
    if (
      !utilisateurId ||
      !partenaireId ||
      !deviseId ||
      !expediteur ||
      !receveur ||
      !montant_cfa ||
      !telephone_receveur
    ) {
      return res.status(400).json({
        message: "Tous les champs obligatoires doivent être remplis.",
      });
    }

    // Vérifier si le partenaire existe
    const partenaire = await Partenaire.findByPk(partenaireId);
    if (!partenaire) {
      return res.status(404).json({ message: "Partenaire introuvable." });
    }

    // Récupérer les informations de l'utilisateur connecté
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Récupérer les informations de la devise
    const devise = await Devise.findByPk(deviseId);
    if (!devise) {
      return res.status(404).json({ message: "Devise introuvable." });
    }

    const Prix1 = devise.prix_1 || 0;
    const Prix2 = devise.prix_2 || 0;
    const Sign1 = devise.signe_1;
    const Sign2 = devise.signe_2;
    const PaysDest = devise.paysArriver;

    const montant_due = (montant_cfa / Prix1) * Prix2; // Calcul du montant dû

    // Générer le code automatiquement
    const lastEntry = await Entre.findOne({
      order: [["id", "DESC"]],
    });

    let newCode = "AB0001";
    if (lastEntry) {
      const lastCode = lastEntry.code || "";
      const numericPart = parseInt(lastCode.slice(2), 10);
      if (!isNaN(numericPart)) {
        const incrementedPart = (numericPart + 1).toString().padStart(4, "0");
        newCode = `AB${incrementedPart}`;
      }
    }

    if (devise.paysArriver === partenaire.pays) {
      // Créer une nouvelle entrée
      const entre = await Entre.create({
        utilisateurId,
        partenaireId,
        deviseId,
        pays_exp: "Guinée",
        pays_dest: PaysDest,
        code: newCode,
        expediteur,
        nomCLient: "",
        montant,
        receveur,
        montant_gnf: montant_due,
        signe_1: Sign1,
        signe_2: Sign2,
        montant_cfa: montant_cfa || 0,
        prix_1: Prix1,
        prix_2: Prix2,
        telephone_receveur,
      });

      // Mettre à jour le montant_prêter du partenaire
      partenaire.montant_preter =
        (partenaire.montant_preter || 0) + montant_cfa;
      await partenaire.save();

      res.status(201).json({
        message: "Entrée créée avec succès.",
        entre,
        solde: utilisateur.solde,
        montant_preter: partenaire.montant_preter,
      });
    } else {
      res.status(400).json({
        message:
          "Le pays de destination ne correspond pas au pays du partenaire.",
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'entrée :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const ajouterAutreEntre = async (req, res) => {
  try {
    const { utilisateurId, nomCLient, montantClient } = req.body;

    // Vérifier si tous les champs obligatoires sont présents
    if (!utilisateurId || !nomCLient || !montantClient) {
      return res.status(400).json({
        message: "Tous les champs obligatoires doivent être remplis.",
      });
    }

    // Récupérer les informations de l'utilisateur connecté
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Générer un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Créer une nouvelle entrée avec un code généré automatiquement
    const entre = await Entre.create({
      utilisateurId,
      partenaireId: null,
      deviseId: null,
      pays_exp: "",
      pays_dest: "",
      code: code,
      expediteur: "",
      nomCLient,
      montantClient,
      receveur: "",
      montant_gnf: 0,
      signe_1: "",
      signe_2: "",
      montant_cfa: 0,
      prix_1: 0,
      prix_2: 0,
      telephone_receveur: "",
      status: "PAYEE",
    });

    // Mettre à jour le solde de l'utilisateur
    utilisateur.solde = (utilisateur.solde || 0) + montantClient;
    await utilisateur.save();

    res.status(201).json({
      message: "Entrée créée avec succès.",
      entre,
      solde: utilisateur.solde,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'entrée :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};


// Compter le nombre d'entrées du jour actuel
const compterEntreesDuJour = async (req, res) => {
  try {
    // Obtenir la date actuelle au format YYYY-MM-DD
    const dateActuelle = new Date().toISOString().slice(0, 10);

    const nombreEntrees = await Entre.count({
      where: Sequelize.where(
        Sequelize.fn("DATE", Sequelize.col("date_creation")),
        dateActuelle
      ),
    });

    res.status(200).json({
      date: dateActuelle,
      nombre_entrees: nombreEntrees,
    });
  } catch (error) {
    console.error("Erreur lors du comptage des entrées du jour :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const annulerEntre = async (req, res) => {
  try {

    const { code } = req.params;

    const { type_annuler, montant_rembourser } = req.body;

    const entre = await Entre.findOne({ where: { code } });
    if (!entre) return res.status(404).json({ message: "Entrée introuvable." });

    const [utilisateur] = await Promise.all([
      Utilisateur.findByPk(entre.utilisateurId),
    ]);
    if (!utilisateur) return res.status(404).json({ message: "Utilisateur introuvable." });

    console.log(entre.status);
    console.log(entre.montant_payer);
    console.log(code);
    console.log(type_annuler);
    console.log(montant_rembourser);

    if (entre.status === "ANNULEE" && type_annuler === 'Non Rembourser' && entre.type_annuler === 'EN COURS' && montant_rembourser === null) {
      res.status(400).json({ message: "Veuillez sélectionner le type 'Rembourser'." });
    }

    if (entre.status === "ANNULEE" && entre.type_annuler === 'Rembourser') {
      res.status(400).json({ message: "Cette entrée est déjà annulée." });
    }
    else {
      if (entre.status === "NON PAYEE" && montant_rembourser === 0) {
        const [partenaire] = await Promise.all([
          Partenaire.findByPk(entre.partenaireId),
        ]);
        if (!partenaire)
          return res.status(404).json({ message: "Partenaire introuvable." });
        entre.status = "ANNULEE";
        entre.type_annuler = "Rembourser";
        await entre.save();
        partenaire.montant_preter = (partenaire.montant_preter || 0) - entre.montant_cfa;
        await partenaire.save();
        res.status(200).json({ message: "Entrée annulée avec succès." });
      } else if (entre.status === "PAYEE" && montant_rembourser === 0 && type_annuler === "") {
        if (Number(utilisateur.solde) >= Number(entre.montant_gnf)) {
          const [partenaire] = await Promise.all([
            Partenaire.findByPk(entre.partenaireId),
          ]);
          if (!partenaire)
            return res.status(404).json({ message: "Partenaire introuvable." });
          entre.status = "ANNULEE";
          entre.type_annuler = "Rembourser";
          entre.montant_rembourser = Number(entre.montant_gnf)
          await entre.save();
          utilisateur.solde = (utilisateur.solde || 0) - Number(entre.montant_gnf);
          await utilisateur.save();
          partenaire.montant_preter = (partenaire.montant_preter || 0) - entre.montant_cfa;
          await partenaire.save();
          res.status(400).json({ message: "Entrée annulée avec succès." });
        }
        else {
          res.status(400).json({ message: "Solde insufisant." });
        }
      } else if (entre.status === "EN COURS" && montant_rembourser === 0 && type_annuler === "") {
        if (Number(utilisateur.solde) >= Number(entre.montant_payer)) {
          const [partenaire] = await Promise.all([
            Partenaire.findByPk(entre.partenaireId),
          ]);
          if (!partenaire)
            return res.status(404).json({ message: "Partenaire introuvable." });
          entre.status = "ANNULEE";
          entre.type_annuler = "Rembourser";
          entre.montant_rembourser = Number(entre.montant_payer)
          await entre.save();
          utilisateur.solde = (utilisateur.solde || 0) - Number(entre.montant_payer);
          await utilisateur.save();
          partenaire.montant_preter = (partenaire.montant_preter || 0) - entre.montant_cfa;
          await partenaire.save();
          res.status(400).json({ message: "Entrée annulée avec succès." });
        }
        else {
          res.status(400).json({ message: "Solde insuffisant." });
        }
      } else
        if (entre.status === "PAYEE" && montant_rembourser === 0 && type_annuler === "Non Rembourser") {
          const [partenaire] = await Promise.all([
            Partenaire.findByPk(entre.partenaireId),
          ]);
          if (!partenaire)
            return res.status(404).json({ message: "Partenaire introuvable." });
          entre.status = "ANNULEE";
          entre.type_annuler = type_annuler;
          await entre.save();
          partenaire.montant_preter = (partenaire.montant_preter || 0) - entre.montant_cfa;
          await partenaire.save();
          res.status(200).json({ message: "Entrée annulée avec succès." });
        } else
          if (entre.status === "ANNULEE" && montant_rembourser > 0 && type_annuler === "Rembourser") {
            if (Number(utilisateur.solde) >= Number(montant_rembourser)) {
              const montantEnCoursPayement =
                (Number(entre.montant_rembourser) || 0) + Number(montant_rembourser);

              if (montantEnCoursPayement > entre.montant_payer) {
                return res.status(400).json({
                  message: `Le montant restant à rembourser est de : ${(Number(entre.montant_payer) || 0) -
                    Number(entre.montant_rembourser)
                    }`,
                });
              }
              if (Number(montantEnCoursPayement) < Number(entre.montant_payer)) {
                entre.type_annuler = "EN COURS"
              }
              else
                if (Number(montantEnCoursPayement) === Number(entre.montant_payer)) {
                  entre.type_annuler = type_annuler;
                }
              entre.montant_rembourser = montantEnCoursPayement;
              utilisateur.solde = (utilisateur.solde || 0) - Number(montant_rembourser);
              await utilisateur.save();
              await entre.save();
              res.status(200).json({ message: "Entrée annulée avec succès." });
            }
            else {
              res.status(400).json({ message: "Solde insuffisant." });
            }
          }
      if (entre.status === "EN COURS" && montant_rembourser === 0 && type_annuler === "Non Rembourser") {
        const [partenaire] = await Promise.all([
          Partenaire.findByPk(entre.partenaireId),
        ]);
        if (!partenaire)
          return res.status(404).json({ message: "Partenaire introuvable." });
        entre.status = "ANNULEE";
        entre.type_annuler = type_annuler;
        await entre.save();
        partenaire.montant_preter = (partenaire.montant_preter || 0) - entre.montant_cfa;
        await partenaire.save();
        res.status(200).json({ message: "Entrée annulée avec succès." });
      }
      if (entre.status === "EN COURS" && montant_rembourser > 0 && type_annuler === "Rembourser") {
        const [partenaire] = await Promise.all([
          Partenaire.findByPk(entre.partenaireId),
        ]);
        if (!partenaire)
          return res.status(404).json({ message: "Partenaire introuvable." });
        entre.status = "ANNULEE";
        entre.type_annuler = type_annuler;
        await entre.save();
        partenaire.montant_preter = (partenaire.montant_preter || 0) - entre.montant_cfa;
        await partenaire.save();

        if (Number(utilisateur.solde) >= Number(montant_rembourser)) {
          const montantEnCoursPayement =
            (Number(entre.montant_rembourser) || 0) + Number(montant_rembourser);

          if (montantEnCoursPayement > entre.montant_payer) {
            return res.status(400).json({
              message: `Le montant restant à rembourser est de : ${(Number(entre.montant_payer) || 0) -
                Number(entre.montant_rembourser)
                }`,
            });
          }
          if (Number(montantEnCoursPayement) < Number(entre.montant_payer)) {
            entre.type_annuler = "EN COURS"
          }
          else
            if (Number(montantEnCoursPayement) === Number(entre.montant_payer)) {
              entre.type_annuler = type_annuler;
            }
          entre.montant_rembourser = montantEnCoursPayement;
          utilisateur.solde = (utilisateur.solde || 0) - Number(montant_rembourser);
          await utilisateur.save();
          await entre.save();
          res.status(200).json({ message: "Entrée annulée avec succès." });
        }
        else {
          res.status(400).json({ message: "Solde insuffisant." });
        }
      } else if (entre.status === "ANNULEE" && type_annuler === "") {
        res.status(400).json({ message: "Veuillez saisir un type." });
      }
    }

    // if (entre.status === 'ANNULEE' && entre.type_annuler === 'Rembourser') {
    //    res.status(400).json({ message: "Cette entrée est déjà annulée." });
    // }

    // if (entre.type === 'NON R') {
    //   if (Number(utilisateur.solde) >= Number(montant_rembourser)) {
    //     if (
    //     Number(entre.montant_cfa) === 0 &&
    //     Number(entre.montantClient) > 0 &&
    //     Number.isInteger(parseInt(code)) &&
    //     Number(montant_rembourser) === 0 &&
    //     type_annuler === '' &&
    //     entre.status === 'PAYEE'
    //   ) {
    //     entre.status = "ANNULEE";
    //     entre.type_annuler = "Rembourser";
    //     await entre.save();
    //     utilisateur.solde = (utilisateur.solde || 0) - Number(entre.montantClient);
    //     await utilisateur.save();
    //     res.status(200).json({ message: "Entrée annulée avec succès." });
    //   } else
    //     if (
    //       Number(entre.montant_cfa) === 0 &&
    //       Number(entre.montantClient) > 0 &&
    //       Number.isInteger(parseInt(code)) &&
    //       Number(montant_rembourser) === 0 &&
    //       type_annuler === 'Non Rembourser' &&
    //       entre.status === 'PAYEE'
    //     ) {
    //       entre.status = "ANNULEE";
    //       entre.type_annuler = type_annuler;
    //       await entre.save();
    //       res.status(200).json({ message: "Entrée annulée avec succès." });
    //     }
    //     else
    //       if (
    //         Number(entre.montant_cfa) === 0 &&
    //         Number(entre.montantClient) > 0 &&
    //         Number(montant_rembourser) > 0 &&
    //         Number.isInteger(parseInt(code)) &&
    //         type_annuler === 'EN COURS' &&
    //         entre.status === 'ANNULEE'
    //       ) {
    //         const montantEnCoursPayement =
    //           (Number(entre.montant_rembourser) || 0) + Number(montant_rembourser);

    //         if (Number(montantEnCoursPayement) > Number(entre.montantClient)) {
    //           return res.status(400).json({
    //             message: `Le montant restant à rembourser est de : ${(Number(entre.montantClient) || 0) -
    //               Number(entre.montant_rembourser)
    //               }`,
    //           });
    //         }
    //         entre.status = "ANNULEE";
    //         entre.type_annuler = type_annuler;
    //         entre.montant_rembourser = montantEnCoursPayement;
    //         utilisateur.solde = (utilisateur.solde || 0) - Number(montant_rembourser);
    //         await utilisateur.save();
    //         await entre.save();
    //         res.status(200).json({ message: "Entrée annulée avec succès." });
    //       } else
    //          if (
    //     entre.montant_cfa === 0 &&
    //     entre.montantClient > 0 &&
    //     Number(montant_rembourser) > 0 &&
    //     Number.isInteger(parseInt(code)) &&
    //     type_annuler === 'Rembourser' &&
    //     entre.status === 'ANNULEE'
    //   ) {
    //     const montantEnCoursPayement =
    //       (Number(entre.montant_rembourser) || 0) + Number(montant_rembourser);

    //     if (montantEnCoursPayement > entre.montantClient) {
    //       return res.status(400).json({
    //         message: `Le montant restant à rembourser est de : ${(Number(entre.montantClient) || 0) -
    //           Number(entre.montant_rembourser)
    //           }`,
    //       });
    //     }
    //     entre.status = "ANNULEE";
    //     if (Number(montantEnCoursPayement) < Number(entre.montantClient)) {
    //       entre.type_annuler = "EN COURS"
    //     }
    //     else
    //       if (Number(montantEnCoursPayement) === Number(entre.montantClient)) {
    //         entre.type_annuler = type_annuler;
    //       }
    //     entre.montant_rembourser = montantEnCoursPayement;
    //     utilisateur.solde = (utilisateur.solde || 0) - Number(montant_rembourser);
    //     await utilisateur.save();
    //     await entre.save();
    //     res.status(200).json({ message: "Entrée annulée avec succès." });
    //   }
    //   else if (
    //     Number(entre.nomCLient) === '' &&
    //     Number(entre.montantClient) === 0 &&
    //     Number(montant_rembourser) === 0 &&
    //     entre.type_annuler === 'Non Rembourser' &&
    //     entre.status === 'NON PAYEE'
    //   ) {
    //     const [partenaire] = await Promise.all([
    //       Partenaire.findByPk(entre.partenaireId),
    //     ]);
    //     if (!partenaire)
    //       return res.status(404).json({ message: "Partenaire introuvable." });
    //     entre.status = "ANNULEE";
    //     entre.type_annuler = "Rembourser";
    //     await entre.save();
    //     partenaire.montant_preter = (partenaire.montant_preter || 0) - entre.montant_cfa;
    //     await partenaire.save();
    //     res.status(200).json({ message: "Entrée annulée avec succès." });
    //   }
    //   else
    //     if (entre.status === 'PAYEE' && type_annuler === "Non Rembourser") {
    //       const [partenaire] = await Promise.all([
    //         Partenaire.findByPk(entre.partenaireId),
    //       ]);
    //       if (!partenaire)
    //         return res.status(404).json({ message: "Partenaire introuvable." });
    //       // console.log("je suis ici");
    //       entre.status = "ANNULEE";
    //       entre.type_annuler = type_annuler;
    //       await entre.save();
    //       partenaire.montant_preter = (partenaire.montant_preter || 0) - entre.montant_cfa;
    //       await partenaire.save();
    //       res.status(400).json({ message: "Entrée annulée avec succès." });
    //     }
    //     else
    //       if (entre.status === 'PAYEE' && type_annuler === "Rembourser" && Number(entre.montant_payer) === Number(montant_rembourser)) {
    //         const [partenaire] = await Promise.all([
    //           Partenaire.findByPk(entre.partenaireId),
    //         ]);
    //         if (!partenaire)
    //           return res.status(404).json({ message: "Partenaire introuvable." });
    //         entre.status = "ANNULEE";
    //         entre.type_annuler = "Rembourser";
    //         entre.montant_rembourser = Number(montant_rembourser)
    //         await entre.save();
    //         utilisateur.solde = (utilisateur.solde || 0) - Number(entre.montant_payer);
    //         await utilisateur.save();
    //         partenaire.montant_preter = (partenaire.montant_preter || 0) - entre.montant_cfa;
    //         await partenaire.save();
    //         res.status(400).json({ message: "Entrée annulée avec succès." });
    //       }
    //       else
    //         if (entre.status === 'PAYEE' && type_annuler === "" && montant_rembourser === 0) {
    //           const [partenaire] = await Promise.all([
    //             Partenaire.findByPk(entre.partenaireId),
    //           ]);
    //           if (!partenaire)
    //             return res.status(404).json({ message: "Partenaire introuvable." });
    //           entre.status = "ANNULEE";
    //           entre.type_annuler = "Rembourser";
    //           await entre.save();
    //           utilisateur.solde = (utilisateur.solde || 0) - Number(entre.montant_payer);
    //           await utilisateur.save();
    //           partenaire.montant_preter = (partenaire.montant_preter || 0) - entre.montant_cfa;
    //           await partenaire.save();
    //           res.status(400).json({ message: "Entrée annulée avec succès." });
    //         }
    //         else
    //           if (entre.status === 'EN COURS' && type_annuler === "Non Rembourser") {
    //             const [partenaire] = await Promise.all([
    //               Partenaire.findByPk(entre.partenaireId),
    //             ]);
    //             if (!partenaire)
    //               return res.status(404).json({ message: "Partenaire introuvable." });
    //             entre.status = "ANNULEE";
    //             entre.type_annuler = type_annuler;
    //             await entre.save();
    //             partenaire.montant_preter = (partenaire.montant_preter || 0) - entre.montant_cfa;
    //             await partenaire.save();
    //             res.status(400).json({ message: "Entrée annulée avec succès." });
    //           }
    //           else
    //             if (entre.status === 'EN COURS' && Number(entre.montant_payer) === Number(montant_rembourser) && type_annuler === "Rembourser") {
    //               const [partenaire] = await Promise.all([
    //                 Partenaire.findByPk(entre.partenaireId),
    //               ]);
    //               if (!partenaire)
    //                 return res.status(404).json({ message: "Partenaire introuvable." });
    //               entre.status = "ANNULEE";
    //               entre.type_annuler = type_annuler;
    //               await entre.save();
    //               utilisateur.solde = (utilisateur.solde || 0) - Number(entre.montant_payer);
    //               await utilisateur.save();
    //               partenaire.montant_preter = (partenaire.montant_preter || 0) - entre.montant_cfa;
    //               await partenaire.save();
    //               res.status(400).json({ message: "Entrée annulée avec succès." });
    //             }
    //             else
    //               if (entre.status === 'PAYEE ' && Number(entre.montant_payer) === Number(montant_rembourser) && type_annuler === "Rembourser") {
    //                 const [partenaire] = await Promise.all([
    //                   Partenaire.findByPk(entre.partenaireId),
    //                 ]);
    //                 if (!partenaire)
    //                   return res.status(404).json({ message: "Partenaire introuvable." });
    //                 entre.status = "ANNULEE";
    //                 entre.type_annuler = type_annuler;
    //                 await entre.save();
    //                 utilisateur.solde = (utilisateur.solde || 0) - Number(entre.montant_payer);
    //                 await utilisateur.save();
    //                 partenaire.montant_preter = (partenaire.montant_preter || 0) - entre.montant_cfa;
    //                 await partenaire.save();
    //                 res.status(400).json({ message: "Entrée annulée avec succès." });
    //               }
    //               else
    //                 if (entre.status === 'EN COURS' && type_annuler === "EN COURS") {
    //                   const [partenaire] = await Promise.all([
    //                     Partenaire.findByPk(entre.partenaireId),
    //                   ]);
    //                   if (!partenaire)
    //                     return res.status(404).json({ message: "Partenaire introuvable." });
    //                   const montantEnCoursPayement =
    //                     (Number(entre.montant_rembourser) || 0) + Number(montant_rembourser);

    //                   if (montantEnCoursPayement > entre.montant_payer) {
    //                     return res.status(400).json({
    //                       message: `Le montant restant à rembourser est de : ${(Number(entre.montant_payer) || 0) -
    //                         Number(entre.montant_rembourser)
    //                         }`,
    //                     });
    //                   }
    //                   entre.status = "ANNULEE";
    //                   entre.type_annuler = type_annuler;
    //                   entre.montant_rembourser = montantEnCoursPayement;
    //                   await entre.save();
    //                   utilisateur.solde = (utilisateur.solde || 0) - Number(montant_rembourser);
    //                   await utilisateur.save();
    //                   partenaire.montant_preter = (partenaire.montant_preter || 0) - entre.montant_cfa;
    //                   await partenaire.save();
    //                   res.status(200).json({ message: "Entrée annulée avec succès." });
    //                 }
    //                 else
    //                   if (entre.status === 'ANNULEE' && type_annuler === "EN COURS") {
    //                     const montantEnCoursPayement =
    //                       (Number(entre.montant_rembourser) || 0) + Number(montant_rembourser);

    //                     if (montantEnCoursPayement > entre.montant_payer) {
    //                       return res.status(400).json({
    //                         message: `Le montant restant à rembourser est de : ${(Number(entre.montant_payer) || 0) -
    //                           Number(entre.montant_rembourser)
    //                           }`,
    //                       });
    //                     }
    //                     entre.status = "ANNULEE";
    //                     entre.type_annuler = type_annuler;
    //                     entre.montant_rembourser = montantEnCoursPayement;
    //                     await entre.save();
    //                     utilisateur.solde = (utilisateur.solde || 0) - Number(montant_rembourser);
    //                     await utilisateur.save();
    //                     res.status(200).json({ message: "Entrée annulée avec succès." });
    //                   }
    //                   else
    //                     if (entre.status === 'ANNULEE' && type_annuler === "Rembourser") {
    //                       const montantEnCoursPayement =
    //                         (Number(entre.montant_rembourser) || 0) + Number(montant_rembourser);

    //                       if (montantEnCoursPayement > entre.montant_payer) {
    //                         return res.status(400).json({
    //                           message: `Le montant restant à rembourser est de : ${(Number(entre.montant_payer) || 0) -
    //                             Number(entre.montant_rembourser)
    //                             }`,
    //                         });
    //                       }
    //                       entre.status = "ANNULEE";
    //                       if (Number(montantEnCoursPayement) < Number(entre.montant_payer)) {
    //                         entre.type_annuler = "EN COURS"
    //                       }
    //                       else
    //                         if (Number(montantEnCoursPayement) === Number(entre.montant_payer)) {
    //                           entre.type_annuler = type_annuler;
    //                         }
    //                       entre.montant_rembourser = montantEnCoursPayement;
    //                       await entre.save();
    //                       utilisateur.solde = (utilisateur.solde || 0) - Number(montant_rembourser);
    //                       await utilisateur.save();
    //                       res.status(200).json({ message: "Entrée annulée avec succès." });
    //                     }
    // } else {
    //   res.status(400).json({ message: "Le solde disponible dans la caisse est insuffisant pour effectuer cette opération." });
    // }
    // } else{
    //    res.status(400).json({ message: "On ne peut pas annuler une entrée retournée." });
    // }
  } catch (error) {

  }
}



// const annulerEntre = async (req, res) => {
//   try {
//     const { code } = req.params;
//     const { type_annuler, montant_rembourser } = req.body;

//     // Vérifier si l'entrée existe
//     const entre = await Entre.findOne({ where: { code } });
//     if (!entre) return res.status(404).json({ message: "Entrée introuvable." });

//     const [utilisateur] = await Promise.all([
//       Utilisateur.findByPk(entre.utilisateurId),
//     ]);

//     if (entre.montant_cfa === 0 && entre.status === "PAYEE") {
//       if (
//         type_annuler === "Non Rembourser" &&
//         ["PAYEE"].includes(entre.status)
//       ) {
//         entre.type_annuler = type_annuler;
//         return res
//           .status(400)
//           .json({ message: `Entrée annulée non rembourser.` });
//       }

//       const montantEnCoursPayement =
//         (Number(entre.montant_rembourser) || 0) + Number(montant_rembourser);

//       if (montantEnCoursPayement > entre.montantClient) {
//         return res.status(400).json({
//           message: `Le montant restant à rembourser est de : ${
//             (Number(entre.montantClient) || 0) -
//             Number(entre.montant_rembourser)
//           }`,
//         });
//       }

//       if (type_annuler === "Rembourser" && ["PAYEE"].includes(entre.status)) {
//         if (utilisateur.solde > montant_rembourser) {
//           if (montant_rembourser < entre.montantClient) {
//             entre.type_annuler = "EN COURS";
//           }
//           entre.montant_rembourser = montantEnCoursPayement;
//           await entre.save();
//           utilisateur.solde =
//             (utilisateur.solde || 0) - Number(montant_rembourser);
//           await utilisateur.save();
//           if (entre.montant_rembourser === entre.montantClient) {
//             entre.status = "ANNULEE";
//             entre.type_annuler = type_annuler;
//             await entre.save();
//             return res
//               .status(400)
//               .json({ message: `Entrée annulée avec succès.sjsjjs` });
//           }
//           return res
//             .status(400)
//             .json({ message: `Entrée annulée avec succès....dhh` });
//         } else {
//           return res.status(400).json({ message: `Le montant insuffisant` });
//         }
//       }
//     }
//     if (entre.montant_cfa === 0 && entre.status === "ANNULEE") {
//       return res
//         .status(400)
//         .json({ message: `Cette entrée est déjà annulée.` });
//     }

//     const [partenaire] = await Promise.all([
//       Partenaire.findByPk(entre.partenaireId),
//     ]);

//     if (!partenaire)
//       return res.status(404).json({ message: "Partenaire introuvable." });
//     if (!utilisateur)
//       return res.status(404).json({ message: "Utilisateur introuvable." });

//     if (entre.status === "NON PAYEE") {
//       if (entre.status !== "ANNULEE") {
//         partenaire.montant_preter =
//           (partenaire.montant_preter || 0) - entre.montant_cfa;
//         await partenaire.save();
//       }
//       entre.status = "ANNULEE";
//       entre.type_annuler = type_annuler;
//       await entre.save();
//       return res.status(400).json({ message: `Entrée annulée avec succès.` });
//     }

//     const montantEnCoursPayement =
//       (Number(entre.montant_rembourser) || 0) + Number(montant_rembourser);

//     if (entre.montant_payer === entre.montant_rembourser) {
//       return res
//         .status(400)
//         .json({ message: `Aucun remboursement possible, tout a été payé.` });
//     }

//     if (montantEnCoursPayement > entre.montant_payer) {
//       return res.status(400).json({
//         message: `Le montant restant à rembourser est de : ${
//           (Number(entre.montant_payer) || 0) - Number(entre.montant_rembourser)
//         }`,
//       });
//     }

//     if (
//       type_annuler === "Rembourser" &&
//       ["PAYEE", "EN COURS", "ANNULEE"].includes(entre.status)
//     ) {
//       entre.montant_rembourser = montantEnCoursPayement;
//       utilisateur.solde = (utilisateur.solde || 0) - Number(montant_rembourser);
//       await utilisateur.save();
//     }

//     if (entre.status !== "ANNULEE") {
//       partenaire.montant_preter =
//         (partenaire.montant_preter || 0) - entre.montant_cfa;
//       await partenaire.save();
//     }

//     entre.status = "ANNULEE";
//     entre.type_annuler = type_annuler;
//     await entre.save();

//     res.status(200).json({ message: "Entrée annulée avec succès.", entre });
//   } catch (error) {
//     console.error("Erreur lors de l'annulation de l'entrée :", error);
//     res.status(500).json({ message: "Erreur interne du serveur." });
//   }
// };

const payerEntrees = async (req, res) => {
  try {
    const { ids } = req.body; // Récupérer les IDs des entrées cochées

    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: "Aucune entrée sélectionnée." });
    }

    // Vérifier si une des entrées a déjà le type "R"
    const entreesExistantes = await Entre.findAll({
      where: { id: ids },
      attributes: ["id", "type"], // Sélectionner seulement les champs nécessaires
    });

    const dejaPayees = entreesExistantes.filter((entre) => entre.type === "R");

    if (dejaPayees.length > 0) {
      return res.status(400).json({
        message:
          "Certaines entrées ont déjà été payées et ne peuvent être payées deux fois.",
        entrees: dejaPayees.map((entre) => entre.id), // Retourne les IDs des entrées déjà payées
      });
    }

    // Mettre à jour le statut des entrées sélectionnées
    await Entre.update({ type: "R" }, { where: { id: ids } });

    res.status(200).json({ message: "Paiement effectué avec succès." });
  } catch (error) {
    console.error("Erreur lors du paiement des entrées :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

module.exports = {
  ajouterAutreEntre,
  ajouterEntre,
  recupererEntreesAvecAssocies,
  compterEntreesDuJour,
  annulerEntre,
  payerEntrees,
};
