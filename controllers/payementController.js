const Utilisateur = require("../models/utilisateurs");
const Entre = require("../models/entres");
const Payement = require("../models/payement");
const { Sequelize } = require("sequelize");
const Sortie = require("../models/sorties");

const ajouterPayement = async (req, res) => {
  try {
    let { utilisateurId, code, montant, prix, type, signe } = req.body;
    prix = prix ?? 0;
    signe = signe ?? 0;

    if (!utilisateurId || !code || !montant || !type) {
      return res
        .status(400)
        .json({ message: "Tous les champs sont obligatoires." });
    }

    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }
    console.log(signe);
    console.log(prix);

    if (type === "ENTREE") {
      const entre = await Entre.findOne({ where: { code } });
      if (!entre) {
        return res
          .status(404)
          .json({ message: "Entre introuvable avec ce code." });
      }
      if (prix === 0) {
        const montantEnCoursPayement = montant + entre.montant_payer;
        if (montantEnCoursPayement > entre.montant_gnf) {
          return res.status(400).json({
            message: `Le montant payé est supérieur au montant restant qui est : ${entre.montant_restant.toLocaleString(
              "fr-FR",
              { minimumFractionDigits: 0, maximumFractionDigits: 0 }
            )}`,
          });
        } else {
          entre.montant_payer = (entre.montant_payer ?? 0) + montant;
          entre.montant_restant = (entre.montant_gnf ?? 0) - entre.montant_payer;
          const payement = await Payement.create({
            utilisateurId,
            entreId: entre.id,
            code: code,
            montant,
            type,
            prix,
            signe
          });

          utilisateur.solde = (utilisateur.solde || 0) + montant;
          await utilisateur.save();

          if (entre.montant_restant === 0) {
            entre.status = "PAYEE";
          } else if (entre.montant_payer < entre.montant_gnf) {
            entre.status = "EN COURS";
          }
          await entre.save();
          res.status(201).json({
            message: "Payement ajouté avec succès.",
            payement,
          });
        }
      } else {
        if (signe === "USD") {

          const montantDeviseGnf = montant / 100 * prix
          const montantEnCoursPayement = montantDeviseGnf + entre.montant_payer;
          if (montantEnCoursPayement > entre.montant_gnf) {
            return res.status(400).json({
              message: `Le montant payé est supérieur au montant restant qui est : ${entre.montant_restant.toLocaleString(
                "fr-FR",
                { minimumFractionDigits: 0, maximumFractionDigits: 0 }
              )}`,
            });
          } else {
            entre.montant_payer = (entre.montant_payer ?? 0) + montantDeviseGnf;
            entre.montant_restant = (entre.montant_gnf ?? 0) - entre.montant_payer;
            const payement = await Payement.create({
              utilisateurId,
              entreId: entre.id,
              code: code,
              montant,
              type,
              prix,
              signe
            });

            utilisateur.solde = (utilisateur.solde || 0) + montantDeviseGnf;
            await utilisateur.save();

            if (entre.montant_restant === 0) {
              entre.status = "PAYEE";
            } else if (entre.montant_payer < entre.montant_gnf) {
              entre.status = "EN COURS";
            }
            await entre.save();
            res.status(201).json({
              message: "Payement ajouté avec succès.",
              payement,
            });
          }
        }
        else if (signe === "EURO") {

          const montantDeviseGnf = montant / 100 * prix
          console.log(montantDeviseGnf);
          const montantEnCoursPayement = montantDeviseGnf + entre.montant_payer;
          if (montantEnCoursPayement > entre.montant_gnf) {
            return res.status(400).json({
              message: `Le montant payé est supérieur au montant restant qui est : ${entre.montant_restant.toLocaleString(
                "fr-FR",
                { minimumFractionDigits: 0, maximumFractionDigits: 0 }
              )}`,
            });
          } else {
            entre.montant_payer = (entre.montant_payer ?? 0) + montantDeviseGnf;
            entre.montant_restant = (entre.montant_gnf ?? 0) - entre.montant_payer;
            // Ajouter une entrée dans la table Payement
            const payement = await Payement.create({
              utilisateurId,
              entreId: entre.id, // Inclure entreId
              code: code, // Inclure entreId
              montant,
              type,
              prix,
              signe
            });

            // Mettre à jour le solde de l'utilisateur connecté
            utilisateur.solde = (utilisateur.solde || 0) + montantDeviseGnf;
            await utilisateur.save();

            // Vérification du montant restant pour définir le type de paiement
            if (entre.montant_restant === 0) {
              entre.status = "PAYEE";
            } else if (entre.montant_payer < entre.montant_gnf) {
              entre.status = "EN COURS";
            }
            await entre.save();
            res.status(201).json({
              message: "Payement ajouté avec succès.",
              payement,
            });
          }
        } else if (signe === "XOF") {
          const montantDeviseGnf = montant / 5000 * prix
          const montantEnCoursPayement = montantDeviseGnf + entre.montant_payer;
          if (montantEnCoursPayement > entre.montant_gnf) {
            return res.status(400).json({
              message: `Le montant payé est supérieur au montant restant qui est : ${entre.montant_restant.toLocaleString(
                "fr-FR",
                { minimumFractionDigits: 0, maximumFractionDigits: 0 }
              )}`,
            });
          } else {
            entre.montant_payer = (entre.montant_payer ?? 0) + montantDeviseGnf;
            entre.montant_restant = (entre.montant_gnf ?? 0) - entre.montant_payer;
            const payement = await Payement.create({
              utilisateurId,
              entreId: entre.id,
              code: code,
              montant,
              type,
              prix,
              signe
            });

            utilisateur.solde = (utilisateur.solde || 0) + montantDeviseGnf;
            await utilisateur.save();

            if (entre.montant_restant === 0) {
              entre.status = "PAYEE";
            } else if (entre.montant_payer < entre.montant_gnf) {
              entre.status = "EN COURS";
            }
            await entre.save();
            res.status(201).json({
              message: "Payement ajouté avec succès.",
              payement,
            });
          }
        }
        else {
          return res
            .status(404)
            .json({ message: "Signe non renseigner." });
        }
      }
    } else if (type === "SORTIE") {
      const sortie = await Sortie.findOne({ where: { code } });
      if (!sortie) {
        return res
          .status(404)
          .json({ message: "Sortie introuvable avec ce code." });
      }


      if (prix === 0) {
        if (Number(utilisateur.solde) >= Number(montant)) {
          const montantEnCoursPayement = Number(montant) + Number(sortie.montant_payer);
          if (montantEnCoursPayement > Number(sortie.montant_gnf)) {
            const montantGnf = Number(sortie.montant_gnf);
            const montantRestant = Number(sortie.montant_restant);
            res.status(400).json({
              message: `Le montant payé ${montant.toLocaleString("fr-FR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })} GNF, est supérieur au montant restant qui est: ${Number(sortie.montant_payer) === 0
                ?
                montantGnf.toLocaleString("fr-FR", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
                :
                montantRestant.toLocaleString("fr-FR", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
                } GNF`,
            });
          } else {
            sortie.montant_payer = Number(sortie.montant_payer ?? 0) + Number(montant);
            sortie.montant_restant =
              Number(sortie.montant_gnf ?? 0) - Number(sortie.montant_payer);

            // Ajouter une entrée dans la table Payement
            const payement = await Payement.create({
              utilisateurId,
              sortieId: sortie.id, // Inclure entreId
              code: code, // Inclure entreId
              montant,
              type,
            });

            // Mettre à jour le solde de l'utilisateur connecté
            utilisateur.solde = Number(utilisateur.solde || 0) - Number(montant);
            await utilisateur.save();

            if (Number(sortie.montant_restant) === 0) {
              sortie.status = "PAYEE";
            } else if (Number(sortie.montant_payer) < Number(sortie.montant_gnf)) {
              sortie.status = "EN COURS";
            }

            await sortie.save();
            res.status(201).json({
              message: "Payement ajouté avec succès.",
              payement,
            });
          }
        } else {
          const solde = Number(utilisateur.solde);
          // console.log(solde);
          res.status(400).json({
            message: `On ne peut pas faire un payement de ${montant.toLocaleString(
              "fr-FR",
              { minimumFractionDigits: 0, maximumFractionDigits: 0 }
            )} GNF, le solde dans la caisse est: ${solde.toLocaleString(
              "fr-FR",
              {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }
            )} GNF`,
          });
        }
      }
      else if(signe === "EURO"){
          const montantDeviseGnf = montant / 100 * prix
         if (Number(utilisateur.solde) >= Number(montantDeviseGnf)) {
          const montantEnCoursPayement = Number(montantDeviseGnf) + Number(sortie.montant_payer);
          if (montantEnCoursPayement > Number(sortie.montant_gnf)) {
            const montantGnf = Number(sortie.montant_gnf);
            const montantRestant = Number(sortie.montant_restant);
            res.status(400).json({
              message: `Le montant payé ${montantDeviseGnf.toLocaleString("fr-FR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })} GNF, est supérieur au montant restant qui est: ${Number(sortie.montant_payer) === 0
                ?
                montantGnf.toLocaleString("fr-FR", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
                :
                montantRestant.toLocaleString("fr-FR", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
                } GNF`,
            });
          } else {
            sortie.montant_payer = Number(sortie.montant_payer ?? 0) + Number(montantDeviseGnf);
            sortie.montant_restant =
              Number(sortie.montant_gnf ?? 0) - Number(sortie.montant_payer);

            // Ajouter une entrée dans la table Payement
            const payement = await Payement.create({
              utilisateurId,
              sortieId: sortie.id, // Inclure entreId
              code: code, // Inclure entreId
              montant,
              type,
              prix,
              signe
            });

            // Mettre à jour le solde de l'utilisateur connecté
            utilisateur.solde = Number(utilisateur.solde || 0) - Number(montantDeviseGnf);
            await utilisateur.save();

            if (Number(sortie.montant_restant) === 0) {
              sortie.status = "PAYEE";
            } else if (Number(sortie.montant_payer) < Number(sortie.montant_gnf)) {
              sortie.status = "EN COURS";
            }

            await sortie.save();
            res.status(201).json({
              message: "Payement ajouté avec succès.",
              payement,
            });
          }
        } else {
          const solde = Number(utilisateur.solde);
          // console.log(solde);
          res.status(400).json({
            message: `On ne peut pas faire un payement de ${montantDeviseGnf.toLocaleString(
              "fr-FR",
              { minimumFractionDigits: 0, maximumFractionDigits: 0 }
            )} GNF, le solde dans la caisse est: ${solde.toLocaleString(
              "fr-FR",
              {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }
            )} GNF`,
          });
        }
      }else if(signe === "USD"){
          const montantDeviseGnf = montant / 100 * prix
         if (Number(utilisateur.solde) >= Number(montantDeviseGnf)) {
          const montantEnCoursPayement = Number(montantDeviseGnf) + Number(sortie.montant_payer);
          if (montantEnCoursPayement > Number(sortie.montant_gnf)) {
            const montantGnf = Number(sortie.montant_gnf);
            const montantRestant = Number(sortie.montant_restant);
            res.status(400).json({
              message: `Le montant payé ${montantDeviseGnf.toLocaleString("fr-FR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })} GNF, est supérieur au montant restant qui est: ${Number(sortie.montant_payer) === 0
                ?
                montantGnf.toLocaleString("fr-FR", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
                :
                montantRestant.toLocaleString("fr-FR", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
                } GNF`,
            });
          } else {
            sortie.montant_payer = Number(sortie.montant_payer ?? 0) + Number(montantDeviseGnf);
            sortie.montant_restant =
              Number(sortie.montant_gnf ?? 0) - Number(sortie.montant_payer);

            // Ajouter une entrée dans la table Payement
            const payement = await Payement.create({
              utilisateurId,
              sortieId: sortie.id, // Inclure entreId
              code: code, // Inclure entreId
              montant,
              type,
              prix,
              signe
            });

            // Mettre à jour le solde de l'utilisateur connecté
            utilisateur.solde = Number(utilisateur.solde || 0) - Number(montantDeviseGnf);
            await utilisateur.save();

            if (Number(sortie.montant_restant) === 0) {
              sortie.status = "PAYEE";
            } else if (Number(sortie.montant_payer) < Number(sortie.montant_gnf)) {
              sortie.status = "EN COURS";
            }

            await sortie.save();
            res.status(201).json({
              message: "Payement ajouté avec succès.",
              payement,
            });
          }
        } else {
          const solde = Number(utilisateur.solde);
          // console.log(solde);
          res.status(400).json({
            message: `On ne peut pas faire un payement de ${montantDeviseGnf.toLocaleString(
              "fr-FR",
              { minimumFractionDigits: 0, maximumFractionDigits: 0 }
            )} GNF, le solde dans la caisse est: ${solde.toLocaleString(
              "fr-FR",
              {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }
            )} GNF`,
          });
        }
      }
      else if(signe === "XOF"){
          const montantDeviseGnf = montant / 5000 * prix
         if (Number(utilisateur.solde) >= Number(montantDeviseGnf)) {
          const montantEnCoursPayement = Number(montantDeviseGnf) + Number(sortie.montant_payer);
          if (montantEnCoursPayement > Number(sortie.montant_gnf)) {
            const montantGnf = Number(sortie.montant_gnf);
            const montantRestant = Number(sortie.montant_restant);
            res.status(400).json({
              message: `Le montant payé ${montantDeviseGnf.toLocaleString("fr-FR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })} GNF, est supérieur au montant restant qui est: ${Number(sortie.montant_payer) === 0
                ?
                montantGnf.toLocaleString("fr-FR", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
                :
                montantRestant.toLocaleString("fr-FR", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
                } GNF`,
            });
          } else {
            sortie.montant_payer = Number(sortie.montant_payer ?? 0) + Number(montantDeviseGnf);
            sortie.montant_restant =
              Number(sortie.montant_gnf ?? 0) - Number(sortie.montant_payer);

            // Ajouter une entrée dans la table Payement
            const payement = await Payement.create({
              utilisateurId,
              sortieId: sortie.id, // Inclure entreId
              code: code, // Inclure entreId
              montant,
              type,
              prix,
              signe
            });

            // Mettre à jour le solde de l'utilisateur connecté
            utilisateur.solde = Number(utilisateur.solde || 0) - Number(montantDeviseGnf);
            await utilisateur.save();

            if (Number(sortie.montant_restant) === 0) {
              sortie.status = "PAYEE";
            } else if (Number(sortie.montant_payer) < Number(sortie.montant_gnf)) {
              sortie.status = "EN COURS";
            }

            await sortie.save();
            res.status(201).json({
              message: "Payement ajouté avec succès.",
              payement,
            });
          }
        } else {
          const solde = Number(utilisateur.solde);
          // console.log(solde);
          res.status(400).json({
            message: `On ne peut pas faire un payement de ${montantDeviseGnf.toLocaleString(
              "fr-FR",
              { minimumFractionDigits: 0, maximumFractionDigits: 0 }
            )} GNF, le solde dans la caisse est: ${solde.toLocaleString(
              "fr-FR",
              {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }
            )} GNF`,
          });
        }
      }
      else {
          return res
            .status(404)
            .json({ message: "Signe non renseigner." });
        }
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout du payement :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Compter le nombre d'entrées du jour actuel
const compterPayementDuJour = async (req, res) => {
  try {
    // Obtenir la date actuelle au format YYYY-MM-DD
    const dateActuelle = new Date().toISOString().slice(0, 10);

    const nombrePayement = await Payement.count({
      where: Sequelize.where(
        Sequelize.fn("DATE", Sequelize.col("date_creation")),
        dateActuelle
      ),
    });

    res.status(200).json({
      date: dateActuelle,
      nombre_payement: nombrePayement,
    });
  } catch (error) {
    console.error("Erreur lors du comptage des sorties du jour :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Lister toutes les entrées de la table Rembourser avec associations
const listerPayement = async (req, res) => {
  try {
    const Payements = await Payement.findAll({
      include: [
        {
          model: Utilisateur,
          attributes: ["id", "nom", "prenom", "email"], // Champs à inclure pour l'utilisateur
        },
        {
          model: Entre,
          attributes: [
            "id",
            "code",
            "expediteur",
            "pays_dest",
            "montant_cfa",
            "montant_payer",
            "montant_restant",
          ],
        },
        {
          model: Sortie,
          attributes: [
            "id",
            "code",
            "expediteur",
            "pays_exp",
            "receveur",
            "montant",
            "montant_payer",
            "montant_restant",
          ],
        },
      ],
    });

    if (Payements.length === 0) {
      return res.status(404).json({ message: "Aucun payement trouvé." });
    }

    res.status(200).json(Payements);
  } catch (error) {
    console.error("Erreur lors de la récupération des payement :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

module.exports = { ajouterPayement, listerPayement, compterPayementDuJour };
