const Depense = require('../models/depense');
const Utilisateur = require('../models/utilisateurs');
const { Op } = require('sequelize');




// API pour calculer la somme des dépenses du jour actuel
const sommeDepenseAujourdHui = async (req, res) => {
  try {
    const aujourdHui = new Date();
    const debutJour = new Date(aujourdHui.setHours(0, 0, 0, 0));   // Début de la journée
    const finJour = new Date(aujourdHui.setHours(23, 59, 59, 999)); // Fin de la journée

    // Calcul de la somme des dépenses pour aujourd'hui
    const totalDepense = await Depense.sum('montant', {
      where: {
        createdAt: {
          [Op.between]: [debutJour, finJour],
        },
      },
    });

    res.status(200).json({
      date: debutJour.toISOString().split('T')[0], // Format : YYYY-MM-DD
      totalDepense: totalDepense || 0, // Retourne 0 si aucune dépense n'est trouvée
    });
  } catch (error) {
    console.error('Erreur lors du calcul des dépenses du jour :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};



const ajouterDepense = async (req, res) => {
  try {
    const { utilisateurId, motif, montant } = req.body;

    // Vérifier si tous les champs nécessaires sont fournis
    if (!utilisateurId || !motif || montant === undefined) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    console.log(utilisateur.solde);
    console.log(montant);

    // Vérifier si l'utilisateur a suffisamment de solde
    if (utilisateur.solde >= montant) {
      // Créer une nouvelle dépense
      const depense = await Depense.create({
        utilisateurId,
        motif,
        montant,
      });

      // Mettre à jour le solde de l'utilisateur
      utilisateur.solde -= montant;
      await utilisateur.save();

      // Envoyer la réponse une seule fois
      return res.status(201).json({
        message: 'Dépense ajoutée avec succès.',
        depense,
      });
    } else {
      return res.status(400).json({ message: "Solde insuffisant." });
    }

  } catch (error) {
    console.error('Erreur lors de l\'ajout de la dépense :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};


const recupererDepense = async (req, res) => {
  try {
    // Récupérer tous les partenaires avec les informations de l'utilisateur associé
    const depense = await Depense.findAll({
      include: [
        {
          model: Utilisateur,
          attributes: ['id', 'nom', 'prenom', 'email'], // Vous pouvez spécifier les attributs que vous voulez afficher
        },
      ],
    });

    // Si aucune dépense n'est trouvée
    if (depense.length === 0) {
      return res.status(404).json({ message: 'Aucune dépense trouvée.' }); // Assurez-vous d'ajouter un return ici
    }

    return res.status(200).json(depense); // Ajoutez return ici aussi
  } catch (error) {
    console.error('Erreur lors de la récupération des dépenses :', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' }); // Ajoutez return ici
  }
};


module.exports = { ajouterDepense, recupererDepense, sommeDepenseAujourdHui};
