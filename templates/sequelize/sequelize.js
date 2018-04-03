const Sequelize = require('sequelize');

// Add MySQL schema name, username, password and url here!
const sequelize = new Sequelize(
  '',
  '',
  '', {
    host: '',
    dialect: 'mysql',
  }
);