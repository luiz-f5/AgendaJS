const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  status: { type: DataTypes.ENUM('agendada', 'confirmada', 'cancelada', 'concluida'), defaultValue: 'agendada' },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  hour: { type: DataTypes.STRING(10), allowNull: false },
  doctorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  patientId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  scheduleId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
}, {
  tableName: 'appointments',
  timestamps: true,
});

module.exports = Appointment;


