const Sequelize = require('sequelize');

const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: true },
});

module.exports.db = db;
module.exports.Op = Sequelize.Op;
module.exports.Karma = db.import('./models/karma');
module.exports.Swears = db.import('./models/swears');
module.exports.Lists = db.import('./models/lists');
