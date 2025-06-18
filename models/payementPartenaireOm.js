const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Utilisateur = require('./utilisateurs');
const PartenaireOM = require('./partenaireOM'); 


const PayementPartenaireOm = sequelize.define('PayementPartenaireOm', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  utilisateurId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  partenaireOMId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  montant_depot: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
   type: {
    type: DataTypes.ENUM('DEPOT', 'REMBOURSEMENT'),
    allowNull: false,
    defaultValue: 'DEPOT', 
  },
});

PayementPartenaireOm.belongsTo(Utilisateur, { foreignKey: 'utilisateurId' });
PayementPartenaireOm.belongsTo(PartenaireOM, { foreignKey: 'partenaireOMId' });

module.exports = PayementPartenaireOm;
