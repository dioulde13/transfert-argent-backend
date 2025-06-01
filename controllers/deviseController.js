const Devise = require('../models/devises');
const Utilisateur = require('../models/utilisateurs');



const recupererDevises = async (req, res) => {
    try {
      // Récupérer toutes les devises
      const devises = await Devise.findAll(
        {
            include: [
              {
                model: Utilisateur,
                attributes: ['id', 'nom', 'prenom', 'email'], // Vous pouvez spécifier les attributs que vous voulez afficher
              },
            ],
          }
      );
  
      // Si aucune devise n'est trouvée
      if (devises.length === 0) {
        return res.status(404).json({ message: 'Aucune devise trouvée.' });
      }
  
      res.status(200).json(devises);
    } catch (error) {
      console.error('Erreur lors de la récupération des devises :', error);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  };

const ajouterDevise = async (req, res) => {
  try {
    const { utilisateurId, paysArriver, signe_2, prix_1 , prix_2} = req.body;

    // Vérifier si tous les champs requis sont fournis
    if (!utilisateurId || !paysArriver || !signe_2 || !prix_1 || !prix_2) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    // Créer une nouvelle devise
    const devise = await Devise.create({
      utilisateurId,
      paysDepart:'Guinée',
      paysArriver,
      signe_1:'GNF',
      signe_2,
      prix_1,
      prix_2
    });

    res.status(201).json({
      message: 'Devise créée avec succès.',
      devise,
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la devise :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

// Modifier une devise
const modifierDevise = async (req, res) => {
  try {
    const { id } = req.params; // ID de la devise à modifier
    const { utilisateurId, paysArriver, signe_2, prix_1, prix_2 } = req.body;

    // Vérifier si la devise existe
    const devise = await Devise.findByPk(id);
    if (!devise) {
      return res.status(404).json({ message: 'Devise non trouvée.' });
    }

    // Mettre à jour les champs fournis
    await devise.update({
      utilisateurId: utilisateurId || devise.utilisateurId,
      paysArriver: paysArriver || devise.paysArriver,
      signe_2: signe_2 || devise.signe_2,
      prix_1: prix_1 || devise.prix_1,
      prix_2: prix_2 || devise.prix_2
    });

    res.status(200).json({
      message: 'Devise mise à jour avec succès.',
      devise,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la devise :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};


module.exports = { ajouterDevise, recupererDevises, modifierDevise};

