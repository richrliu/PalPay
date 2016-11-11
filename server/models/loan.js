'use strict';
module.exports = function(sequelize, DataTypes) {
  var Loan = sequelize.define('Loan', {
    CompletionStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    Amount: DataTypes.FLOAT,
    ExpectedEndDate: DataTypes.DATE,
    InterestRate: DataTypes.FLOAT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Loan.hasMany(models.Payment);
        Loan.belongsTo(models.Users, {foreignKey: 'Lender'});
        Loan.belongsTo(models.Users, {foreignKey: 'Receiver'});
        Loan.belongsTo(models.Negotiation);
      }
    }
  });
  return Loan;
};