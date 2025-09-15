const Utilisateur = require("../models/utilisateurs");
const Entre = require("../models/entres");
const Payement = require("../models/payement");
const { Sequelize } = require("sequelize");
const Sortie = require("../models/sorties");


const modifierPayement = async (req, res) => {
  try {
    const { id } = req.params;
    let { code, montant, prix, signe, date_creation } = req.body;

    const payement = await Payement.findByPk(id, {
      include: [Utilisateur, Entre, Sortie]
    });


    if (!payement) {
      return res.status(404).json({ message: "Payement introuvable." });
    }

    const utilisateur = payement.Utilisateur;
    let entre = payement.entreId ? await Entre.findByPk(payement.entreId) : null;
    let sortie = payement.sortieId ? await Sortie.findByPk(payement.sortieId) : null;

    // Calculs ou validations avant modification si nécessaire
    if (montant <= 0) {
      return res.status(400).json({ message: "Le montant doit être supérieur à 0." });
    }

    // Modifier les champs du paiement
    payement.code = code ?? payement.code;
    payement.montant = montant ?? payement.montant;
    payement.prix = prix ?? payement.prix;
    payement.signe = signe ?? payement.signe;
    payement.date_creation = date_creation ?? payement.date_creation;

    if (entre) {
      if (signe === "XOF") {
        if (Number(prix) !== Number(entre.previous('prix'))) {
          return res
            .status(404)
            .json({ message: `le prix saisi: ${prix} est different au prix du code qui est: ${payement.previous('prix')}` });
        }
      }

      const payements = await Payement.findAll({ where: { entreId: entre.id } });

      const ancienMontant = Number(payement.previous('montant'));
      const encienPrix = Number(payement.previous('prix'));
      const nouveauMontant = Number(payement.montant);
      const nouveauPrix = Number(payement.prix);
      let totalPaye, totalEncien, nouveauMontants, soustraction, montantPayer, montantRestant;

      if ((signe === "USD" || signe === "EURO") && ((payement.previous('signe') === "USD") || payement.previous('signe') === "EURO")) {
        // console.log("Encien USD ou EURO  Nouveau EURO ou USD");
        const totalPaye = payements.reduce((total, p) => {
          // console.log("Montant", p.montant);
          // console.log("Prix", p.prix);
          // console.log("Signe", p.signe);

          if (p.signe === "XOF") {
            return total + (Number(p.montant) / 5000 * Number(p.prix));
          } else if (p.signe === "EURO") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "USD") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "GNF") {

            return total + (Number(p.montant));
          }
          // si aucun signe ne correspond, retourner simplement total
          return total;
        }, 0);

        // console.log("Sommme total encien Payer", totalPaye);

        totalEncien = (ancienMontant / 100) * encienPrix;
        nouveauMontants = (nouveauMontant / 100) * nouveauPrix;
        soustraction = totalPaye - totalEncien;
        montantPayer = nouveauMontants + soustraction;

        montantRestant = Number(entre.montant_gnf) - montantPayer;

        // console.log("Encien  montant", totalEncien);
        // console.log("Nouveau montant", nouveauMontant);
        // console.log("Nouveau prix", nouveauPrix);
        // console.log("soustraction", soustraction);
        // console.log("Montant Payer", montantPayer);
        // console.log("Montant Restant ", montantRestant);

        entre.montant_payer = montantPayer;
        entre.montant_restant = montantRestant;
      }

      if ((signe === "XOF") && ((payement.previous('signe') === "USD") || payement.previous('signe') === "EURO")) {
        console.log("Encien USD ou EURO  Nouveau XOF");
        const totalPaye = payements.reduce((total, p) => {
          // console.log("Montant", p.montant);
          // console.log("Prix", p.prix);
          // console.log("Signe", p.signe);

          if (p.signe === "XOF") {
            return total + (Number(p.montant) / 5000 * Number(p.prix));
          } else if (p.signe === "EURO") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "USD") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "GNF") {

            return total + (Number(p.montant));
          }
          // si aucun signe ne correspond, retourner simplement total
          return total;
        }, 0);

        // console.log("Sommme total encien Payer", totalPaye);

        totalEncien = (ancienMontant / 100) * encienPrix;
        nouveauMontants = (nouveauMontant / 5000) * nouveauPrix;
        soustraction = totalPaye - totalEncien;
        montantPayer = nouveauMontants + soustraction;

        montantRestant = Number(entre.montant_gnf) - montantPayer;

        // console.log("Encien montant", totalEncien);
        // console.log("Nouveau prix", encienPrix);
        // console.log("Nouveau montant", nouveauMontant);
        // console.log("Nouveau prix", nouveauPrix);
        // console.log("Montant", nouveauMontants);
        // console.log("soustraction", soustraction);
        // console.log("Montant Payer", montantPayer);
        // console.log("Montant Restant ", montantRestant);

        entre.montant_payer = montantPayer;
        entre.montant_restant = montantRestant;
      }

      if ((signe === "GNF") && ((payement.previous('signe') === "USD") || payement.previous('signe') === "EURO")) {
        // console.log("Encien USD ou EURO  Nouveau GNF");
        const totalPaye = payements.reduce((total, p) => {
          // console.log("Montant", p.montant);
          // console.log("Prix", p.prix);
          // console.log("Signe", p.signe);

          if (p.signe === "XOF") {
            return total + (Number(p.montant) / 5000 * Number(p.prix));
          } else if (p.signe === "EURO") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "USD") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "GNF") {

            return total + (Number(p.montant));
          }
          // si aucun signe ne correspond, retourner simplement total
          return total;
        }, 0);

        // console.log("Sommme total encien Payer", totalPaye);

        totalEncien = (ancienMontant / 100) * encienPrix;
        nouveauMontants = nouveauMontant;
        soustraction = totalPaye - totalEncien;
        montantPayer = nouveauMontants + soustraction;

        montantRestant = Number(entre.montant_gnf) - montantPayer;

        // console.log("Encien montant", totalEncien);
        // console.log("Nouveau prix", encienPrix);
        // console.log("Nouveau montant", nouveauMontant);
        // console.log("Nouveau prix", nouveauPrix);
        // console.log("Montant", nouveauMontants);
        // console.log("soustraction", soustraction);
        // console.log("Montant Payer", montantPayer);
        // console.log("Montant Restant ", montantRestant);

        entre.montant_payer = montantPayer;
        entre.montant_restant = montantRestant;
      }

      else if ((signe === "USD" || signe === "EURO") && ((payement.previous('signe') === "XOF"))) {
        // console.log("Encien XOF Nouveau USD ou EURO");
        const totalPaye = payements.reduce((total, p) => {
          // console.log("Montant", p.montant);
          // console.log("Prix", p.prix);
          // console.log("Signe", p.signe);

          if (p.signe === "XOF") {
            return total + (Number(p.montant) / 5000 * Number(p.prix));
          } else if (p.signe === "EURO") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "USD") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "GNF") {
            return total + (Number(p.montant));
          }
          // si aucun signe ne correspond, retourner simplement total
          return total;
        }, 0);

        // console.log("Sommme total encien Payer", totalPaye);

        totalEncien = (ancienMontant / 5000) * encienPrix;
        soustraction = totalPaye - totalEncien;

        nouveauMontants = (nouveauMontant / 100) * nouveauPrix;
        montantPayer = nouveauMontants + soustraction;

        montantRestant = Number(entre.montant_gnf) - montantPayer;

        // console.log("Encien  montant", totalEncien);
        // console.log("Nouveau montant", nouveauMontant);
        // console.log("Nouveau prix", nouveauPrix);
        // console.log("soustraction", soustraction);
        // console.log("Montant Payer", montantPayer);
        // console.log("Montant Restant ", montantRestant);

        entre.montant_payer = montantPayer;
        entre.montant_restant = montantRestant;
      }
      else if ((signe === "GNF") && ((payement.previous('signe') === "XOF"))) {
        console.log("encien XOF nouveau GNF");
        const totalPaye = payements.reduce((total, p) => {
          // console.log("Montant", p.montant);
          // console.log("Prix", p.prix);
          // console.log("Signe", p.signe);
          if (p.signe === "XOF") {
            return total + (Number(p.montant) / 5000 * Number(p.prix));
          } else if (p.signe === "EURO") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "USD") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          }
          else if (p.signe === "GNF") {
            return total + (Number(p.montant));
          }
          // si aucun signe ne correspond, retourner simplement total
          return total;
        }, 0);

        // console.log("Sommme total encien Payer", totalPaye);

        const totalEncien = (ancienMontant / 5000) * encienPrix;
        const soustraction = totalPaye - totalEncien;

        // console.log({ totalEncien, soustraction });

        nouveauMontants = (nouveauMontant);
        montantPayer = nouveauMontants + soustraction;

        montantRestant = Number(entre.montant_gnf) - montantPayer;

        // console.log("Encien  montant", totalEncien);
        // console.log("Nouveau montant", nouveauMontant);
        // console.log("Nouveau prix", nouveauPrix);
        // console.log("soustraction", soustraction);
        // console.log("Montant Payer", montantPayer);
        // console.log("Montant Restant ", montantRestant);

        entre.montant_payer = montantPayer;
        entre.montant_restant = montantRestant;
      }
      else if (signe === "XOF" && ((payement.previous('signe') === "GNF"))) {
        // console.log("Encien GNF nouveau XOF");
        const totalPaye = payements.reduce((total, p) => {
          // console.log("Montant", p.montant);
          // console.log("Prix", p.prix);
          // console.log("Signe", p.signe);

          if (p.signe === "XOF") {
            return total + (Number(p.montant) / 5000 * Number(p.prix));
          } else if (p.signe === "EURO") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "USD") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          }
          else if (p.signe === "GNF") {
            return total + (Number(p.montant));
          }
          return total;
        }, 0);

        // console.log("Sommme total encien Payer", totalPaye);

        totalEncien = ancienMontant;
        nouveauMontants = (nouveauMontant / 5000) * nouveauPrix;
        soustraction = totalPaye - totalEncien;
        // console.log({ totalEncien, soustraction });

        montantPayer = nouveauMontants + soustraction;
        montantRestant = Number(entre.montant_gnf) - montantPayer;

        // console.log("Encien  montant", totalEncien);
        // console.log("Nouveau montant", nouveauMontant);
        // console.log("Nouveau prix", nouveauPrix);
        // console.log("soustraction", soustraction);
        // console.log("Montant Payer", montantPayer);
        // console.log("Montant Restant ", montantRestant);

        entre.montant_payer = montantPayer;
        entre.montant_restant = montantRestant;
      }
      else if ((signe === "EURO" || signe === "USD") && ((payement.previous('signe') === "GNF"))) {
        console.log("Encien GNF nouveau EURO OU USD");
        const totalPaye = payements.reduce((total, p) => {
          // console.log("Montant", p.montant);
          // console.log("Prix", p.prix);
          // console.log("Signe", p.signe);

          if (p.signe === "XOF") {
            return total + (Number(p.montant) / 5000 * Number(p.prix));
          } else if (p.signe === "EURO") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "USD") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          }
          else if (p.signe === "GNF") {
            return total + (Number(p.montant));
          }
          return total;
        }, 0);

        // console.log("Sommme total encien Payer", totalPaye);

        totalEncien = ancienMontant;
        nouveauMontants = (nouveauMontant / 100) * nouveauPrix;

        soustraction = totalPaye - totalEncien;

        // console.log({ totalEncien, soustraction });

        montantPayer = nouveauMontants + soustraction;

        montantRestant = Number(entre.montant_gnf) - montantPayer;

        // console.log("Encien  montant", totalEncien);
        // console.log("Nouveau montant", nouveauMontant);
        // console.log("Nouveau prix", nouveauPrix);
        // console.log("soustraction", soustraction);
        // console.log("Montant Payer", montantPayer);
        // console.log("Montant Restant ", montantRestant);

        entre.montant_payer = montantPayer;
        entre.montant_restant = montantRestant;
      }
      else if ((signe === "XOF") && ((payement.previous('signe') === "XOF"))) {
        console.log("Encien XOF nouveau XOF");
        const totalPaye = payements.reduce((total, p) => {
          // console.log("Montant", p.montant);
          // console.log("Prix", p.prix);
          // console.log("Signe", p.signe);

          if (p.signe === "XOF") {
            return total + (Number(p.montant) / 5000 * Number(p.prix));
          } else if (p.signe === "EURO") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "USD") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          }
          else if (p.signe === "GNF") {
            return total + (Number(p.montant));
          }
          return total;
        }, 0);

        // console.log("Sommme total encien Payer", totalPaye);

        totalEncien = (ancienMontant / 5000) * encienPrix;
        nouveauMontants = (nouveauMontant / 5000) * nouveauPrix;

        soustraction = totalPaye - totalEncien;

        montantPayer = nouveauMontants + soustraction;

        montantRestant = Number(entre.montant_gnf) - montantPayer;

        // console.log("Encien  montant", totalEncien);
        // console.log("Nouveau montant", nouveauMontant);
        // console.log("Nouveau prix", nouveauPrix);
        // console.log("soustraction", soustraction);
        // console.log("Montant Payer", montantPayer);
        // console.log("Montant Restant ", montantRestant);

        entre.montant_payer = montantPayer;
        entre.montant_restant = montantRestant;
      }
      else if (signe === "GNF" && payement.previous('signe') === "GNF") {
        console.log("Encien GNF Nouveau GNF");
        const totalPaye = payements.reduce((total, p) => {
          // console.log("Montant", p.montant);
          // console.log("Prix", p.prix);
          // console.log("Signe", p.signe);

          if (p.signe === "XOF") {
            return total + (Number(p.montant) / 5000 * Number(p.prix));
          } else if (p.signe === "EURO") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "USD") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          }
          else if (p.signe === "GNF") {
            return total + (Number(p.montant));
          }
          return total;
        }, 0);

        // console.log("Sommme total encien Payer", totalPaye);

        totalEncien = ancienMontant;
        nouveauMontants = nouveauMontant;
        soustraction = totalPaye - totalEncien;
        montantPayer = nouveauMontants + soustraction;
        montantRestant = Number(entre.montant_gnf) - montantPayer;

        // console.log("Encien  montant", totalEncien);
        // console.log("Nouveau montant", nouveauMontant);
        // console.log("Nouveau prix", nouveauPrix);
        // console.log("soustraction", soustraction);
        // console.log("Montant Payer", montantPayer);
        // console.log("Montant Restant ", montantRestant);

        entre.montant_payer = montantPayer;
        entre.montant_restant = montantRestant;
      }


      if (signe === "USD" && payement.previous('signe') === "USD" && utilisateur.soldePayerAvecCodeDolar >= ancienMontant) {
        // console.log("USD->USD");

        utilisateur.soldePayerAvecCodeDolar -= Number(ancienMontant);
        utilisateur.soldePayerAvecCodeDolar += Number(montant);
        payement.montant = Number(montant);
      }
      else if (signe === "EURO" && payement.previous('signe') === "EURO" && utilisateur.soldePayerAvecCodeEuro >= ancienMontant) {
        // console.log("EURO->EURO");

        utilisateur.soldePayerAvecCodeEuro -= ancienMontant;
        utilisateur.soldePayerAvecCodeEuro += montant;
        payement.montant = Number(montant);
      } else if (signe === "XOF" && payement.previous('signe') === "XOF" && utilisateur.soldePayerAvecCodeXOF >= ancienMontant) {
        // console.log("XOF->XOF");

        utilisateur.soldePayerAvecCodeXOF -= Number(ancienMontant);
        utilisateur.soldePayerAvecCodeXOF += Number(montant);
        payement.montant = Number(montant);
      } else if (payement.previous('signe') === "GNF" && signe === "GNF" && utilisateur.solde >= ancienMontant) {
        // console.log("GNF->GNF");

        utilisateur.solde -= Number(ancienMontant);
        utilisateur.solde += Number(montant);
        payement.montant = Number(montant);
      } else
        if (signe === "EURO" && payement.previous('signe') === "USD" && utilisateur.soldePayerAvecCodeDolar >= ancienMontant) {
          // console.log("USD->EURO");

          utilisateur.soldePayerAvecCodeDolar -= Number(ancienMontant);
          utilisateur.soldePayerAvecCodeEuro += Number(montant);
          payement.montant = Number(montant);
        }

        else if (signe === "USD" && payement.previous('signe') === "EURO" && utilisateur.soldePayerAvecCodeEuro >= ancienMontant) {
          // console.log("EURO->USD");

          utilisateur.soldePayerAvecCodeEuro -= Number(ancienMontant);
          utilisateur.soldePayerAvecCodeDolar += Number(montant);
          payement.montant = Number(montant);
        }
        else if (signe === "XOF" && payement.previous('signe') === "EURO" && utilisateur.soldePayerAvecCodeEuro >= ancienMontant) {
          // console.log("EURO->XOF");

          utilisateur.soldePayerAvecCodeEuro -= Number(ancienMontant);
          utilisateur.soldePayerAvecCodeXOF += Number(montant);
          payement.montant = Number(montant);
        }
        else if (signe === "EURO" && payement.previous('signe') === "XOF" && utilisateur.soldePayerAvecCodeXOF >= ancienMontant) {
          utilisateur.soldePayerAvecCodeXOF -= Number(ancienMontant);
          utilisateur.soldePayerAvecCodeEuro += Number(montant);
          payement.montant = Number(montant);
        }
        else if (signe === "XOF" && payement.previous('signe') === "USD" && utilisateur.soldePayerAvecCodeDolar >= ancienMontant) {
          // console.log("USD->XOF");

          utilisateur.soldePayerAvecCodeDolar -= Number(ancienMontant);
          utilisateur.soldePayerAvecCodeXOF += Number(montant);
          payement.montant = Number(montant);
        }
        else if (signe === "USD" && payement.previous('signe') === "XOF" && utilisateur.soldePayerAvecCodeXOF >= ancienMontant) {
          // console.log("XOF->USD");

          utilisateur.soldePayerAvecCodeXOF -= Number(ancienMontant);
          utilisateur.soldePayerAvecCodeDolar += Number(montant);
          payement.montant = Number(montant);
        }

        //GNF et les autres signe
        else if (payement.previous('signe') === "GNF" && signe === "XOF" && utilisateur.solde >= ancienMontant) {
          // console.log("GNF->XOF");

          utilisateur.solde -= Number(ancienMontant);
          utilisateur.soldePayerAvecCodeXOF += Number(montant);
          payement.montant = Number(montant);
        }
        else if (payement.previous('signe') === "GNF" && signe === "USD" && utilisateur.solde >= ancienMontant) {
          // console.log("GNF->USD");

          utilisateur.solde -= Number(ancienMontant);
          utilisateur.soldePayerAvecCodeDolar += Number(montant);
          payement.montant = Number(montant);
        }
        else if (payement.previous('signe') === "GNF" && signe === "EURO" && utilisateur.solde >= ancienMontant) {
          // console.log("GNF->EURO");

          utilisateur.solde -= Number(ancienMontant);
          utilisateur.soldePayerAvecCodeEuro += Number(montant);
          payement.montant = Number(montant);
        }

        //les autres signe a GNF 
        else if (payement.previous('signe') === "XOF" && signe === "GNF" && utilisateur.soldePayerAvecCodeXOF >= ancienMontant) {
          // console.log("XOF->GNF");

          utilisateur.soldePayerAvecCodeXOF -= Number(ancienMontant);
          utilisateur.solde += Number(montant);
          payement.montant = Number(montant);
        }
        else if (payement.previous('signe') === "USD" && signe === "GNF" && utilisateur.soldePayerAvecCodeDolar >= ancienMontant) {
          // console.log("USD->GNF");

          utilisateur.soldePayerAvecCodeDolar -= Number(ancienMontant);
          utilisateur.solde += Number(montant);
          payement.montant = Number(montant);
        }
        else if (payement.previous('signe') === "EURO" && signe === "GNF" && utilisateur.soldePayerAvecCodeEuro >= ancienMontant) {
          // console.log("EURO->GNF");

          utilisateur.soldePayerAvecCodeEuro -= Number(ancienMontant);
          utilisateur.solde += Number(montant);
          payement.montant = Number(montant);
        }
        else {
          return res.status(404).json({
            message: `Le montant dans la caisse est inferieure au montant:${ancienMontant.toLocaleString(
              "fr-FR",
              { minimumFractionDigits: 0, maximumFractionDigits: 0 }
            )}`
          });
        }
      if (montantPayer > entre.montant_gnf) {
        console.log(montantPayer);
        console.log(entre.montant_gnf);
        return res.status(400).json({
          message: `Le montant payé est supérieur au montant restant`,
        });
      } else {
        if (entre.montant_restant === 0) {
          entre.status = "PAYEE";
        } else if (entre.montant_payer < entre.montant_gnf) {
          entre.status = "EN COURS";
        }
        await entre.save();
        await payement.save();
        await utilisateur.save();
      }
    }


    if (sortie) {
      // console.log(sortie.previous('prix_2'));
      if (signe === "XOF") {
        if (Number(prix) !== Number(sortie.previous('prix_2'))) {
          return res
            .status(404)
            .json({ message: `le prix saisi: ${prix} est different au prix du code qui est: ${sortie.previous('prix_2')}` });
        }
      }

      const payements = await Payement.findAll({ where: { sortieId: sortie.id } });

      const ancienMontant = Number(payement.previous('montant'));
      const encienPrix = Number(payement.previous('prix'));
      const nouveauMontant = Number(payement.montant);
      const nouveauPrix = Number(payement.prix);
      // console.log("Sortie");
      // console.log(payement.previous('signe'));

      let totalPaye, totalEncien, nouveauMontants, soustraction, montantPayer, montantRestant;

      if ((signe === "USD" || signe === "EURO") && ((payement.previous('signe') === "USD") || payement.previous('signe') === "EURO")) {
        // console.log("Encien USD ou EURO  Nouveau EURO ou USD");
        const totalPaye = payements.reduce((total, p) => {
          // console.log("Montant", p.montant);
          // console.log("Prix", p.prix);
          // console.log("Signe", p.signe);

          if (p.signe === "XOF") {
            return total + (Number(p.montant) / 5000 * Number(p.prix));
          } else if (p.signe === "EURO") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "USD") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "GNF") {

            return total + (Number(p.montant));
          }
          // si aucun signe ne correspond, retourner simplement total
          return total;
        }, 0);

        // console.log("Sommme total encien Payer", totalPaye);

        totalEncien = (ancienMontant / 100) * encienPrix;
        nouveauMontants = (nouveauMontant / 100) * nouveauPrix;
        soustraction = totalPaye - totalEncien;
        montantPayer = nouveauMontants + soustraction;

        montantRestant = Number(sortie.montant_gnf) - montantPayer;

        // console.log("Encien  montant", totalEncien);
        // console.log("Nouveau montant", nouveauMontant);
        // console.log("Nouveau prix", nouveauPrix);
        // console.log("soustraction", soustraction);
        // console.log("Montant Payer", montantPayer);
        // console.log("Montant Restant ", montantRestant);

        sortie.montant_payer = montantPayer;
        sortie.montant_restant = montantRestant;
      }

      if ((signe === "XOF") && ((payement.previous('signe') === "USD") || payement.previous('signe') === "EURO")) {
        console.log("Encien USD ou EURO  Nouveau XOF");
        const totalPaye = payements.reduce((total, p) => {
          // console.log("Montant", p.montant);
          // console.log("Prix", p.prix);
          // console.log("Signe", p.signe);

          if (p.signe === "XOF") {
            return total + (Number(p.montant) / 5000 * Number(p.prix));
          } else if (p.signe === "EURO") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "USD") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "GNF") {

            return total + (Number(p.montant));
          }
          // si aucun signe ne correspond, retourner simplement total
          return total;
        }, 0);

        // console.log("Sommme total encien Payer", totalPaye);

        totalEncien = (ancienMontant / 100) * encienPrix;
        nouveauMontants = (nouveauMontant / 5000) * nouveauPrix;
        soustraction = totalPaye - totalEncien;
        montantPayer = nouveauMontants + soustraction;

        montantRestant = Number(sortie.montant_gnf) - montantPayer;

        // console.log("Encien montant", totalEncien);
        // console.log("Nouveau prix", encienPrix);
        // console.log("Nouveau montant", nouveauMontant);
        // console.log("Nouveau prix", nouveauPrix);
        // console.log("Montant", nouveauMontants);
        // console.log("soustraction", soustraction);
        // console.log("Montant Payer", montantPayer);
        // console.log("Montant Restant ", montantRestant);

        sortie.montant_payer = montantPayer;
        sortie.montant_restant = montantRestant;
      }

      if ((signe === "GNF") && ((payement.previous('signe') === "USD") || payement.previous('signe') === "EURO")) {
        console.log("Encien USD ou EURO  Nouveau GNF");
        const totalPaye = payements.reduce((total, p) => {
          // console.log("Montant", p.montant);
          // console.log("Prix", p.prix);
          // console.log("Signe", p.signe);

          if (p.signe === "XOF") {
            return total + (Number(p.montant) / 5000 * Number(p.prix));
          } else if (p.signe === "EURO") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "USD") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "GNF") {

            return total + (Number(p.montant));
          }
          // si aucun signe ne correspond, retourner simplement total
          return total;
        }, 0);

        // console.log("Sommme total encien Payer", totalPaye);

        totalEncien = (ancienMontant / 100) * encienPrix;
        nouveauMontants = nouveauMontant;
        soustraction = totalPaye - totalEncien;
        montantPayer = nouveauMontants + soustraction;

        montantRestant = Number(sortie.montant_gnf) - montantPayer;

        // console.log("Encien montant", totalEncien);
        // console.log("Nouveau prix", encienPrix);
        // console.log("Nouveau montant", nouveauMontant);
        // console.log("Nouveau prix", nouveauPrix);
        // console.log("Montant", nouveauMontants);
        // console.log("soustraction", soustraction);
        // console.log("Montant Payer", montantPayer);
        // console.log("Montant Restant ", montantRestant);

        sortie.montant_payer = montantPayer;
        sortie.montant_restant = montantRestant;
      }

      else if ((signe === "USD" || signe === "EURO") && ((payement.previous('signe') === "XOF"))) {
        console.log("Encien XOF Nouveau USD ou EURO");
        const totalPaye = payements.reduce((total, p) => {
          // console.log("Montant", p.montant);
          // console.log("Prix", p.prix);
          // console.log("Signe", p.signe);

          if (p.signe === "XOF") {
            return total + (Number(p.montant) / 5000 * Number(p.prix));
          } else if (p.signe === "EURO") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "USD") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "GNF") {
            return total + (Number(p.montant));
          }
          // si aucun signe ne correspond, retourner simplement total
          return total;
        }, 0);

        // console.log("Sommme total encien Payer", totalPaye);

        totalEncien = (ancienMontant / 5000) * encienPrix;
        soustraction = totalPaye - totalEncien;

        nouveauMontants = (nouveauMontant / 100) * nouveauPrix;
        montantPayer = nouveauMontants + soustraction;

        montantRestant = Number(sortie.montant_gnf) - montantPayer;

        // console.log("Encien  montant", totalEncien);
        // console.log("Nouveau montant", nouveauMontant);
        // console.log("Nouveau prix", nouveauPrix);
        // console.log("soustraction", soustraction);
        // console.log("Montant Payer", montantPayer);
        // console.log("Montant Restant ", montantRestant);

        sortie.montant_payer = montantPayer;
        sortie.montant_restant = montantRestant;
      }
      else if ((signe === "GNF") && ((payement.previous('signe') === "XOF"))) {
        console.log("encien XOF nouveau GNF");
        const totalPaye = payements.reduce((total, p) => {
          // console.log("Montant", p.montant);
          // console.log("Prix", p.prix);
          // console.log("Signe", p.signe);
          if (p.signe === "XOF") {
            return total + (Number(p.montant) / 5000 * Number(p.prix));
          } else if (p.signe === "EURO") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "USD") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          }
          else if (p.signe === "GNF") {
            return total + (Number(p.montant));
          }
          // si aucun signe ne correspond, retourner simplement total
          return total;
        }, 0);

        // console.log("Sommme total encien Payer", totalPaye);

        const totalEncien = (ancienMontant / 5000) * encienPrix;
        const soustraction = totalPaye - totalEncien;

        // console.log({ totalEncien, soustraction });

        nouveauMontants = (nouveauMontant);
        montantPayer = nouveauMontants + soustraction;

        montantRestant = Number(sortie.montant_gnf) - montantPayer;

        // console.log("Encien  montant", totalEncien);
        // console.log("Nouveau montant", nouveauMontant);
        // console.log("Nouveau prix", nouveauPrix);
        // console.log("soustraction", soustraction);
        // console.log("Montant Payer", montantPayer);
        // console.log("Montant Restant ", montantRestant);

        sortie.montant_payer = montantPayer;
        sortie.montant_restant = montantRestant;
      }
      else if (signe === "XOF" && ((payement.previous('signe') === "GNF"))) {
        console.log("Encien GNF nouveau XOF");
        const totalPaye = payements.reduce((total, p) => {
          // console.log("Montant", p.montant);
          // console.log("Prix", p.prix);
          // console.log("Signe", p.signe);

          if (p.signe === "XOF") {
            return total + (Number(p.montant) / 5000 * Number(p.prix));
          } else if (p.signe === "EURO") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "USD") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          }
          else if (p.signe === "GNF") {
            return total + (Number(p.montant));
          }
          return total;
        }, 0);

        // console.log("Sommme total encien Payer", totalPaye);

        totalEncien = ancienMontant;
        nouveauMontants = (nouveauMontant / 5000) * nouveauPrix;
        soustraction = totalPaye - totalEncien;
        // console.log({ totalEncien, soustraction });

        montantPayer = nouveauMontants + soustraction;
        montantRestant = Number(sortie.montant_gnf) - montantPayer;

        // console.log("Encien  montant", totalEncien);
        // console.log("Nouveau montant", nouveauMontant);
        // console.log("Nouveau prix", nouveauPrix);
        // console.log("soustraction", soustraction);
        // console.log("Montant Payer", montantPayer);
        // console.log("Montant Restant ", montantRestant);

        sortie.montant_payer = montantPayer;
        sortie.montant_restant = montantRestant;
      }
      else if ((signe === "EURO" || signe === "USD") && ((payement.previous('signe') === "GNF"))) {
        console.log("Encien GNF nouveau EURO OU USD");
        const totalPaye = payements.reduce((total, p) => {
          // console.log("Montant", p.montant);
          // console.log("Prix", p.prix);
          // console.log("Signe", p.signe);

          if (p.signe === "XOF") {
            return total + (Number(p.montant) / 5000 * Number(p.prix));
          } else if (p.signe === "EURO") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "USD") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          }
          else if (p.signe === "GNF") {
            return total + (Number(p.montant));
          }
          return total;
        }, 0);

        console.log("Sommme total encien Payer", totalPaye);

        totalEncien = ancienMontant;
        nouveauMontants = (nouveauMontant / 100) * nouveauPrix;

        soustraction = totalPaye - totalEncien;

        // console.log({ totalEncien, soustraction });

        montantPayer = nouveauMontants + soustraction;

        montantRestant = Number(sortie.montant_gnf) - montantPayer;

        // console.log("Encien  montant", totalEncien);
        // console.log("Nouveau montant", nouveauMontant);
        // console.log("Nouveau prix", nouveauPrix);
        // console.log("soustraction", soustraction);
        // console.log("Montant Payer", montantPayer);
        // console.log("Montant Restant ", montantRestant);

        sortie.montant_payer = montantPayer;
        sortie.montant_restant = montantRestant;
      }
      else if ((signe === "XOF") && ((payement.previous('signe') === "XOF"))) {
        console.log("Encien XOF nouveau XOF");
        const totalPaye = payements.reduce((total, p) => {
          // console.log("Montant", p.montant);
          // console.log("Prix", p.prix);
          // console.log("Signe", p.signe);

          if (p.signe === "XOF") {
            return total + (Number(p.montant) / 5000 * Number(p.prix));
          } else if (p.signe === "EURO") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "USD") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          }
          else if (p.signe === "GNF") {
            return total + (Number(p.montant));
          }
          return total;
        }, 0);

        // console.log("Sommme total encien Payer", totalPaye);

        totalEncien = (ancienMontant / 5000) * encienPrix;
        nouveauMontants = (nouveauMontant / 5000) * nouveauPrix;

        soustraction = totalPaye - totalEncien;

        montantPayer = nouveauMontants + soustraction;

        montantRestant = Number(sortie.montant_gnf) - montantPayer;

        // console.log("Encien  montant", totalEncien);
        // console.log("Nouveau montant", nouveauMontant);
        // console.log("Nouveau prix", nouveauPrix);
        // console.log("soustraction", soustraction);
        // console.log("Montant Payer", montantPayer);
        // console.log("Montant Restant ", montantRestant);

        sortie.montant_payer = montantPayer;
        sortie.montant_restant = montantRestant;
      }
      else if (signe === "GNF" && payement.previous('signe') === "GNF") {
        console.log("Encien GNF Nouveau GNF");
        const totalPaye = payements.reduce((total, p) => {
          // console.log("Montant", p.montant);
          // console.log("Prix", p.prix);
          // console.log("Signe", p.signe);

          if (p.signe === "XOF") {
            return total + (Number(p.montant) / 5000 * Number(p.prix));
          } else if (p.signe === "EURO") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "USD") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          }
          else if (p.signe === "GNF") {
            return total + (Number(p.montant));
          }
          return total;
        }, 0);

        // console.log("Sommme total encien Payer", totalPaye);
        totalEncien = ancienMontant;
        nouveauMontants = nouveauMontant;
        soustraction = totalPaye - totalEncien;
        montantPayer = nouveauMontants + soustraction;
        montantRestant = Number(sortie.montant_gnf) - montantPayer;

        // console.log("Encien  montant", totalEncien);
        // console.log("Nouveau montant", nouveauMontant);
        // console.log("Nouveau prix", nouveauPrix);
        // console.log("soustraction", soustraction);
        // console.log("Montant Payer", montantPayer);
        // console.log("Montant Restant ", montantRestant);

        sortie.montant_payer = montantPayer;
        sortie.montant_restant = montantRestant;
      }

      else if (signe === "XOFSANSPRIX" && payement.previous('signe') === "XOFSANSPRIX") {
        console.log("Encien XOFSANSPRIX Nouveau XOFSANSPRIX");
        const totalPaye = payements.reduce((total, p) => {
          console.log("Montant", p.montant);
          console.log("Prix", p.prix);
          console.log("Signe", p.signe);

          if (p.signe === "XOF") {
            return total + (Number(p.montant) / 5000 * Number(p.prix));
          } else if (p.signe === "EURO") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          } else if (p.signe === "USD") {
            return total + (Number(p.montant) / 100 * Number(p.prix));
          }
          else if (p.signe === "XOFSANSPRIX") {
            return total + (Number(p.montant));
          }
          return total;
        }, 0);

        // console.log("Sommme total encien Payer", totalPaye);
        totalEncien = ancienMontant;
        nouveauMontants = nouveauMontant;
        soustraction = totalPaye - totalEncien;
        montantPayer = nouveauMontants + soustraction;
        montantRestant = Number(sortie.montant) - montantPayer;

        // console.log("Encien  montant", totalEncien);
        // console.log("Nouveau montant", nouveauMontant);
        // console.log("Nouveau prix", nouveauPrix);
        // console.log("soustraction", soustraction);
        // console.log("Montant Payer", montantPayer);
        // console.log("Montant Restant ", montantRestant);

        sortie.montant_payer = montantPayer;
        sortie.montant_restant = montantRestant;
      }


      if (signe === "XOFSANSPRIX" && payement.previous('signe') === "XOFSANSPRIX" && utilisateur.soldeXOF >= Number(montant)) {
        // console.log("XOFSANSPRIX->XOFSANSPRIX");

        utilisateur.soldeXOF += Number(ancienMontant);
        utilisateur.soldeXOF -= Number(montant);
        payement.montant = Number(montant);
      } else if (signe === "USD" && payement.previous('signe') === "USD" && utilisateur.soldePayerAvecCodeDolar >= Number(montant)) {
        // console.log("USD->USD");

        utilisateur.soldePayerAvecCodeDolar += Number(ancienMontant);
        utilisateur.soldePayerAvecCodeDolar -= Number(montant);
        payement.montant = Number(montant);
      }
      else if (signe === "EURO" && payement.previous('signe') === "EURO" && utilisateur.soldePayerAvecCodeEuro >= Number(montant)) {
        // console.log("EURO->EURO");

        utilisateur.soldePayerAvecCodeEuro += ancienMontant;
        utilisateur.soldePayerAvecCodeEuro -= montant;
        payement.montant = Number(montant);
      } else if (signe === "XOF" && payement.previous('signe') === "XOF" && utilisateur.soldePayerAvecCodeXOF >= Number(montant)) {
        // console.log("XOF->XOF");

        utilisateur.soldePayerAvecCodeXOF += Number(ancienMontant);
        utilisateur.soldePayerAvecCodeXOF -= Number(montant);
        payement.montant = Number(montant);
      } else if (payement.previous('signe') === "GNF" && signe === "GNF" && utilisateur.solde >= Number(montant)) {
        // console.log("GNF->GNF");

        utilisateur.solde += Number(ancienMontant);
        utilisateur.solde -= Number(montant);
        payement.montant = Number(montant);
      } else
        if (signe === "EURO" && payement.previous('signe') === "USD" && utilisateur.soldePayerAvecCodeEuro >= Number(montant)) {
          // console.log("USD->EURO");

          utilisateur.soldePayerAvecCodeDolar += Number(ancienMontant);
          utilisateur.soldePayerAvecCodeEuro -= Number(montant);
          payement.montant = Number(montant);
        }

        else if (signe === "USD" && payement.previous('signe') === "EURO" && utilisateur.soldePayerAvecCodeDolar >= Number(montant)) {
          // console.log("EURO->USD");

          utilisateur.soldePayerAvecCodeEuro += Number(ancienMontant);
          utilisateur.soldePayerAvecCodeDolar -= Number(montant);
          payement.montant = Number(montant);
        }
        else if (signe === "XOF" && payement.previous('signe') === "EURO" && utilisateur.soldePayerAvecCodeXOF >= Number(montant)) {
          // console.log("EURO->XOF");

          utilisateur.soldePayerAvecCodeEuro += Number(ancienMontant);
          utilisateur.soldePayerAvecCodeXOF -= Number(montant);
          payement.montant = Number(montant);
        }
        else if (signe === "EURO" && payement.previous('signe') === "XOF" && utilisateur.soldePayerAvecCodeEuro >= Number(montant)) {
          utilisateur.soldePayerAvecCodeXOF += Number(ancienMontant);
          utilisateur.soldePayerAvecCodeEuro -= Number(montant);
          payement.montant = Number(montant);
        }
        else if (signe === "XOF" && payement.previous('signe') === "USD" && utilisateur.soldePayerAvecCodeXOF >= Number(montant)) {
          // console.log("USD->XOF");

          utilisateur.soldePayerAvecCodeDolar += Number(ancienMontant);
          utilisateur.soldePayerAvecCodeXOF -= Number(montant);
          payement.montant = Number(montant);
        }
        else if (signe === "USD" && payement.previous('signe') === "XOF" && utilisateur.soldePayerAvecCodeDolar >= Number(montant)) {
          // console.log("XOF->USD");

          utilisateur.soldePayerAvecCodeXOF += Number(ancienMontant);
          utilisateur.soldePayerAvecCodeDolar -= Number(montant);
          payement.montant = Number(montant);
        }

        //GNF et les autres signe
        else if (payement.previous('signe') === "GNF" && signe === "XOF" && utilisateur.soldePayerAvecCodeXOF >= Number(montant)) {
          // console.log("GNF->XOF");

          utilisateur.solde += Number(ancienMontant);
          utilisateur.soldePayerAvecCodeXOF -= Number(montant);
          payement.montant = Number(montant);
        }
        else if (payement.previous('signe') === "GNF" && signe === "USD" && utilisateur.soldePayerAvecCodeDolar >= Number(montant)) {
          // console.log("GNF->USD");

          utilisateur.solde += Number(ancienMontant);
          utilisateur.soldePayerAvecCodeDolar -= Number(montant);
          payement.montant = Number(montant);
        }
        else if (payement.previous('signe') === "GNF" && signe === "EURO" && utilisateur.soldePayerAvecCodeEuro >= Number(montant)) {
          // console.log("GNF->EURO");

          utilisateur.solde += Number(ancienMontant);
          utilisateur.soldePayerAvecCodeEuro -= Number(montant);
          payement.montant = Number(montant);
        }

        //les autres signe a GNF 
        else if (payement.previous('signe') === "XOF" && signe === "GNF" && utilisateur.solde >= Number(montant)) {
          // console.log("XOF->GNF");

          utilisateur.soldePayerAvecCodeXOF += Number(ancienMontant);
          utilisateur.solde -= Number(montant);
          payement.montant = Number(montant);
        }
        else if (payement.previous('signe') === "USD" && signe === "GNF" && utilisateur.solde >= Number(montant)) {
          // console.log("USD->GNF");

          utilisateur.soldePayerAvecCodeDolar += Number(ancienMontant);
          utilisateur.solde -= Number(montant);
          payement.montant = Number(montant);
        }
        else if (payement.previous('signe') === "EURO" && signe === "GNF" && utilisateur.solde >= Number(montant)) {
          // console.log("EURO->GNF");

          utilisateur.soldePayerAvecCodeEuro += Number(ancienMontant);
          utilisateur.solde -= Number(montant);
          payement.montant = Number(montant);
        }
        else {
          return res.status(404).json({
            message: `Le montant dans la caisse est inferieure au montant:${Number(montant).toLocaleString(
              "fr-FR",
              { minimumFractionDigits: 0, maximumFractionDigits: 0 }
            )}`
          });
        }
      if (signe === "XOFSANSPRIX") {
        if (montantPayer > sortie.montant) {
          return res.status(400).json({
            message: `Le montant payé ${montantPayer} est supérieur au montant restant`,
          });
        } else {
          if (sortie.montant_restant === 0) {
            sortie.status = "PAYEE";
          } else if (sortie.montant_payer < sortie.montant_gnf) {
            sortie.status = "EN COURS";
          }
          await sortie.save();
          await payement.save();
          await utilisateur.save();
        }
      } else {
        if (montantPayer > sortie.montant_gnf) {
          return res.status(400).json({
            message: `Le montant payé ${montantPayer} est supérieur au montant restant`,
          });
        } else {
          if (sortie.montant_restant === 0) {
            sortie.status = "PAYEE";
          } else if (sortie.montant_payer < sortie.montant_gnf) {
            sortie.status = "EN COURS";
          }
          await sortie.save();
          await payement.save();
          await utilisateur.save();
        }
      }
    }

    res.status(200).json({
      message: "Payement modifié avec succès.",
      payement,
    });
  } catch (error) {
    console.error("Erreur lors de la modification du payement :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};


const ajouterPayement = async (req, res) => {
  try {
    let { utilisateurId, code, montant, date_creation, prix, type, signe } = req.body;
    prix = prix ?? 0;
    signe = signe ?? 0;

    if (!utilisateurId || !code || !montant || !type || !date_creation) {
      return res
        .status(400)
        .json({ message: "Tous les champs sont obligatoires." });
    }

    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }


    if (type === "ENTREE") {
      const entre = await Entre.findOne({ where: { code } });
      if (!entre) {
        return res
          .status(404)
          .json({ message: "Entre introuvable avec ce code." });
      }
      // console.log(entre.previous('prix'));
      // console.log(prix);
      if (signe === "XOF") {
        if (prix !== entre.previous('prix')) {
          return res
            .status(404)
            .json({ message: `le prix saisi: ${prix} est different au prix du code qui est: ${entre.previous('prix')}` });
        }
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
            date_creation,
            type,
            prix,
            signe: "GNF"
          });

          utilisateur.solde = (utilisateur.solde || 0) + montant;
          if (entre.type_payement === "ORANGE MONEY") {
            utilisateur.soldePDV = (utilisateur.soldePDV || 0) + montant;
          }
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
              date_creation,
              type,
              prix,
              signe
            });

            utilisateur.soldePayerAvecCodeDolar = (utilisateur.soldePayerAvecCodeDolar || 0) + montant;
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
            const payement = await Payement.create({
              utilisateurId,
              entreId: entre.id, // Inclure entreId
              code: code, // Inclure entreId
              montant,
              date_creation,
              type,
              prix,
              signe
            });

            utilisateur.soldePayerAvecCodeEuro = (utilisateur.soldePayerAvecCodeEuro || 0) + montant;
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
              date_creation,
              type,
              prix,
              signe
            });

            utilisateur.soldePayerAvecCodeXOF = (utilisateur.soldePayerAvecCodeXOF || 0) + montant;
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
      //console.log(sortie.previous('prix_2'));
      if (signe === "XOF") {
        if (prix !== sortie.previous('prix_2')) {
          return res
            .status(404)
            .json({ message: `le prix saisi: ${prix} est different au prix du code qui est: ${sortie.previous('prix_2')}` });
        }
      }

      if (sortie.etat === "VALIDÉE") {
        if (prix === 0) {
          if (sortie.mode_payement_devise === 'GNF') {
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

                if (sortie.type_payement === "OM") {
                  if (utilisateur.soldePDV >= Number(montant)) {
                    sortie.montant_payer = Number(sortie.montant_payer ?? 0) + Number(montant);
                    sortie.montant_restant = Number(sortie.montant_gnf ?? 0) - Number(sortie.montant_payer);

                    // Ajouter une entrée dans la table Payement
                    const payement = await Payement.create({
                      utilisateurId,
                      sortieId: sortie.id, // Inclure entreId
                      code: code, // Inclure entreId
                      date_creation,
                      montant,
                      type,
                    });

                    utilisateur.soldePDV = Number(utilisateur.soldePDV || 0) - Number(montant);
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
                  } else {
                    return res
                      .status(400)
                      .json({ message: `Solde pdv insuffisant qui est: ${Number(utilisateur.soldePDV)}` });
                  }
                } else {
                  sortie.montant_payer = Number(sortie.montant_payer ?? 0) + Number(montant);
                  sortie.montant_restant = Number(sortie.montant_gnf ?? 0) - Number(sortie.montant_payer);

                  // Ajouter une entrée dans la table Payement
                  const payement = await Payement.create({
                    utilisateurId,
                    sortieId: sortie.id, // Inclure entreId
                    code: code, // Inclure entreId
                    date_creation,
                    montant,
                    type,
                    signe: "GNF"
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
              }
            } else {
              const solde = Number(utilisateur.solde);
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
          } else if (sortie.mode_payement_devise === 'XOF') {
            if ((utilisateur.soldeXOF + utilisateur.soldePayerAvecCodeXOF) >= montant && (utilisateur.soldeXOF + utilisateur.soldePayerAvecCodeXOF) !== 0) {
              const montantEnCoursPayement = Number(montant) + Number(sortie.montant_payer);
              if (montantEnCoursPayement > Number(sortie.montant)) {
                const montantRestant = Number(sortie.montant_restant);
                res.status(400).json({
                  message: `Le montant payé ${montant.toLocaleString("fr-FR", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })} GNF, est supérieur au montant restant qui est: ${Number(sortie.montant_payer) === 0
                    ?
                    montantRestant.toLocaleString("fr-FR", {
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
                sortie.montant_restant = Number(sortie.montant ?? 0) - Number(sortie.montant_payer);
                const payement = await Payement.create({
                  utilisateurId,
                  sortieId: sortie.id,
                  code: code,
                  date_creation,
                  montant,
                  type,
                  signe: "XOFSANSPRIX"
                });


                let reste = montant;

                if (utilisateur.soldeXOF >= reste) {
                  utilisateur.soldeXOF -= reste;
                  reste = 0;
                } else {
                  reste -= utilisateur.soldeXOF;
                  utilisateur.soldeXOF = 0;
                }

                if (reste > 0) {
                  utilisateur.soldePayerAvecCodeXOF -= reste;
                }

                // utilisateur.soldeXOF = Number(utilisateur.soldeXOF || 0) - Number(montant);
                await utilisateur.save();
                if (Number(sortie.montant_restant) === 0) {
                  sortie.status = "PAYEE";
                } else if (Number(sortie.montant_payer) < Number(sortie.montant)) {
                  sortie.status = "EN COURS";
                }
                await sortie.save();
                res.status(201).json({
                  message: "Payement ajouté avec succès.",
                  payement,
                });
              }
            } else {
              const solde = Number(utilisateur.soldeXOF);
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
        }
        else if (signe === "EURO") {
          const montantDeviseGnf = montant / 100 * prix
          if (Number(utilisateur.soldePayerAvecCodeEuro) >= Number(montant)) {
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
              sortie.montant_restant = Number(sortie.montant_gnf ?? 0) - Number(sortie.montant_payer);

              // Ajouter une entrée dans la table Payement
              const payement = await Payement.create({
                utilisateurId,
                sortieId: sortie.id, // Inclure entreId
                code: code, // Inclure entreId
                montant,
                date_creation,
                type,
                prix,
                signe
              });

              // Mettre à jour le solde de l'utilisateur connecté
              utilisateur.soldePayerAvecCodeEuro = Number(utilisateur.soldePayerAvecCodeEuro || 0) - Number(montant);
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
            const solde = Number(utilisateur.soldePayerAvecCodeEuro);
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
        } else if (signe === "USD") {
          const montantDeviseGnf = montant / 100 * prix
          if (Number(utilisateur.soldePayerAvecCodeDolar) >= Number(montant)) {
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
                date_creation,
                type,
                prix,
                signe
              });

              // Mettre à jour le solde de l'utilisateur connecté
              utilisateur.soldePayerAvecCodeDolar = Number(utilisateur.soldePayerAvecCodeDolar || 0) - Number(montant);
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
            const solde = Number(utilisateur.soldePayerAvecCodeDolar);
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
        else if (signe === "XOF") {
          // console.log("sjsjsj");
          const montantDeviseGnf = montant / 5000 * prix
          if (Number(utilisateur.soldePayerAvecCodeXOF + utilisateur.soldeXOF) >= Number(montant)) {
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
              sortie.montant_restant = Number(sortie.montant_gnf ?? 0) - Number(sortie.montant_payer);

              // Ajouter une entrée dans la table Payement
              const payement = await Payement.create({
                utilisateurId,
                sortieId: sortie.id, // Inclure entreId
                code: code, // Inclure entreId
                montant,
                date_creation,
                type,
                prix,
                signe
              });


              let reste = montant;

              if (utilisateur.soldeXOF >= reste) {
                utilisateur.soldeXOF -= reste;
                reste = 0;
              } else {
                reste -= utilisateur.soldeXOF;
                utilisateur.soldeXOF = 0;
              }

              if (reste > 0) {
                utilisateur.soldePayerAvecCodeXOF -= reste;
              }

              // Mettre à jour le solde de l'utilisateur connecté
              // utilisateur.soldePayerAvecCodeXOF = Number(utilisateur.soldePayerAvecCodeXOF || 0) - Number(montant);
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
            const solde = Number(utilisateur.soldePayerAvecCodeXOF + utilisateur.soldeXOF);
            // console.log(solde);
            res.status(400).json({
              message: `On ne peut pas faire un payement de ${montant.toLocaleString(
                "fr-FR",
                { minimumFractionDigits: 0, maximumFractionDigits: 0 }
              )} XOF, le solde dans la caisse est: ${solde.toLocaleString(
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
      } else {
        res.status(400).json({
          message: "Cette sortie n'a pas été validée.",
        });
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
            "code_envoyer",
            "expediteur",
            "pays_dest",
            "montant_cfa",
            "montant_gnf",
            "montant_payer",
            "montant_restant",
            "type_payement",
            "telephone_receveur",
          ],
        },
        {
          model: Sortie,
          attributes: [
            "id",
            "code",
            "codeEnvoyer",
            "expediteur",
            "pays_exp",
            "receveur",
            "mode_payement_devise",
            "type_payement",
            "telephone_receveur",
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

module.exports = { ajouterPayement, listerPayement, compterPayementDuJour, modifierPayement };
