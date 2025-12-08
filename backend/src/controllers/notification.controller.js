const { Notification, User } = require('../models');
const { Op } = require('sequelize');

exports.sendByAdmin = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Somente admin pode enviar notificações gerais' });
  }

  const { subject, message, scope, targetUserId } = req.body;

  if (!['user', 'medicos', 'pacientes', 'todos'].includes(scope)) {
    return res.status(400).json({ message: 'Escopo inválido' });
  }

  const senderName = 'Admin';

  if (scope === 'user' && !targetUserId) {
    return res.status(400).json({ message: 'Usuário alvo obrigatório para escopo user' });
  }

  const notification = await Notification.create({
    subject,
    message,
    scope,
    senderName,
    targetUserId: scope === 'user' ? targetUserId : null
  });

  return res.status(201).json(notification);
};

exports.sendByDoctor = async (req, res) => {
  if (req.user.role !== 'medico') {
    return res.status(403).json({ message: 'Somente médicos podem enviar notificações a pacientes' });
  }

  const { subject, message, patientId } = req.body;

  const patient = await User.findByPk(patientId);
  if (!patient || patient.role !== 'paciente') {
    return res.status(400).json({ message: 'Paciente inválido' });
  }

  let senderName = req.user.name;
  if (!senderName) {
    const doctor = await User.findByPk(req.user.id, { attributes: ['name'] });
    senderName = doctor?.name || 'Médico';
  }

  const notification = await Notification.create({
    subject,
    message,
    scope: 'user',
    senderName,
    targetUserId: patient.id
  });

  return res.status(201).json(notification);
};

exports.listForPatient = async (req, res) => {
  if (req.user.role !== 'paciente') {
    return res.status(403).json({ message: 'Somente pacientes podem ver suas notificações' });
  }

  const notifications = await Notification.findAll({
    where: {
      [Op.or]: [
        { scope: 'todos' },
        { scope: 'pacientes' },
        { scope: 'user', targetUserId: req.user.id }
      ]
    },
    order: [['createdAt', 'DESC']]
  });

  return res.json(notifications);
};

exports.listForDoctor = async (req, res) => {
  if (req.user.role !== 'medico') {
    return res.status(403).json({ message: 'Somente médicos podem ver suas notificações' });
  }

  const notifications = await Notification.findAll({
    where: {
      [Op.or]: [
        { scope: 'todos' },
        { scope: 'medicos' },
        { scope: 'user', targetUserId: req.user.id }
      ]
    },
    order: [['createdAt', 'DESC']]
  });

  return res.json(notifications);
};

exports.listAll = async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Somente admin pode ver todas as notificações' });
    }
  
    const notifications = await Notification.findAll({
      include: [{ model: User, as: 'targetUser', attributes: ['id','name','email','role'] }],
      order: [['createdAt', 'DESC']]
    });
  
    return res.json(notifications);
  };
  
  exports.listSentByDoctor = async (req, res) => {
    if (req.user.role !== 'medico') {
      return res.status(403).json({ message: 'Somente médicos podem ver suas notificações enviadas' });
    }
  
    const notifications = await Notification.findAll({
      where: { senderName: req.user.name },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'targetUser', attributes: ['id','name','email','role'] }]
    });
  
    return res.json(notifications);
  };