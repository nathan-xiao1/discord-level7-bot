const Sequelize = require('sequelize');

// Database Connection
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const KickVotes = sequelize.import('models/KickVotes');

module.exports = { KickVotes };