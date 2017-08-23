const Sequelize = require('sequelize')

module.exports = function (sequelize) {
  return sequelize.define('pokemon', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    price: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    stock: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  })
}
