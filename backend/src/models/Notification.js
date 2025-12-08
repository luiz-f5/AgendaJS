const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  subject: { type: DataTypes.STRING(150), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  scope: { 
    type: DataTypes.ENUM('user', 'medicos', 'pacientes', 'todos'), 
    allowNull: false 
  },
  senderName: { type: DataTypes.STRING(100), allowNull: false },
  targetUserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true } 
}, {
  tableName: 'notifications',
  timestamps: true,
});

module.exports = Notification;
