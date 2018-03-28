const config = require('config');
const Sequelize = require('sequelize');

const dbConfig = config.get('dbConfig');

const sequelize = new Sequelize(
  dbConfig.schema,
  dbConfig.username,
  dbConfig.password, {
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