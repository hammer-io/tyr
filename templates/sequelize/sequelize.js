const config = require('../../config/default.json');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  config.schema,
  config.username,
  config.password, {
    host: config.url,
    dialect: 'mysql',

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  }
);