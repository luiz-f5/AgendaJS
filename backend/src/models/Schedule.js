const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  hour: { type: DataTypes.STRING(10), allowNull: false }, 
}, {
  tableName: 'schedules',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['doctorId', 'hour'] }
  ]
});

module.exports = Schedule;

