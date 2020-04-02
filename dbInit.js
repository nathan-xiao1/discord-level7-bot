const Sequelize = require('sequelize');

// Database Connection
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

// Import models
sequelize.import('models/KickVotes');

// Check for force flag
const force = process.argv.includes('--force') || process.argv.includes('-f');

// Sync database
sequelize.sync({force}).then(() => {
	if (force) {
		console.log('Database force synced');
	} else {
		console.log('Database synced')
	}
})