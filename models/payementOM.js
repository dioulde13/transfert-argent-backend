const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Utilisateur = require('./utilisateurs');
const OrangeMoney = require('./orangeMoney');


const PayementOM = sequelize.define('PayementOM', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  utilisateurId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  orangeMoneyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false, 
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
  }
});

PayementOM.belongsTo(Utilisateur, { foreignKey: 'utilisateurId' });
PayementOM.belongsTo(OrangeMoney, { foreignKey: 'orangeMoneyId' });

module.exports = PayementOM;
