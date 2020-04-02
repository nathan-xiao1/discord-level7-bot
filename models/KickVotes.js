module.exports = (sequelize, DataTypes) => {
	return sequelize.define('kick_votes', {
        user_id: {
            type: DataTypes.STRING,
            primaryKey: true,
			unique: true,
			allowNull: false,
        },
        counts: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		voters: {
			type: DataTypes.INTEGER,
			defaultValue: '[]',
			get: function() {
				return JSON.parse(this.getDataValue('voters'));
			}, 
			set: function(val) {
				return this.setDataValue('voters', JSON.stringify(val));
			}
		}
	}, {
		timestamps: false,
	});
};