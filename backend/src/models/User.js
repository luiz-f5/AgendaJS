const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING(100), allowNull: true },
  role: { 
    type: DataTypes.ENUM('admin', 'medico', 'paciente'), 
    allowNull: true,
    defaultValue: null 
  },
}, {
  tableName: 'users',
  timestamps: true
});


module.exports = User;