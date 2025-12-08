const sequelize = require('../config/database');

const User = require('./User');
const Specialty = require('./Specialty');
const Schedule = require('./Schedule');
const Appointment = require('./Appointment');
const Notification = require('./Notification');

const MedicalFile = require('./MedicalFile');

User.belongsTo(Specialty, { foreignKey: 'specialtyId', as: 'specialty' });
Specialty.hasMany(User, { foreignKey: 'specialtyId', as: 'doctors' });

User.hasMany(Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

User.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
Appointment.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

User.hasMany(Schedule, { foreignKey: 'doctorId', as: 'schedules' });
Schedule.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

Schedule.hasOne(Appointment, { foreignKey: 'scheduleId', as: 'appointment' });
Appointment.belongsTo(Schedule, { foreignKey: 'scheduleId', as: 'schedule' });

Notification.belongsTo(User, { foreignKey: 'targetUserId', as: 'targetUser' });
Notification.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
User.hasMany(Notification, { foreignKey: 'senderId', as: 'sentNotifications' });

async function syncDatabase() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
}

module.exports = { sequelize, User, Specialty, Schedule, Appointment, Notification, MedicalFile, syncDatabase};

