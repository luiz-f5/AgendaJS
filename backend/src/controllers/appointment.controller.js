const { Appointment, Schedule, User, Specialty } = require('../models');
const { Op } = require('sequelize');

exports.create = async (req, res) => {
  try {
    const { specialtyId, doctorId, date, hour } = req.body;
    const patientId = req.user.id;

    if (req.user.role !== 'paciente') {
      return res.status(403).json({ message: 'Somente pacientes podem marcar consultas' });
    }

    const today = new Date();
    const chosenDate = new Date(date);
    if (chosenDate <= today) {
      return res.status(400).json({ message: 'Não é permitido agendar para o dia presente ou passado' });
    }

    const doctor = await User.findByPk(doctorId, { include: { model: Specialty, as: 'specialty' } });
    if (!doctor || doctor.role !== 'medico') {
      return res.status(400).json({ message: 'Médico inválido' });
    }
    if (doctor.specialtyId !== specialtyId) {
      return res.status(400).json({ message: 'Esse médico não pertence à especialidade escolhida' });
    }

    const schedule = await Schedule.findOne({ where: { doctorId, hour } });
    if (!schedule) {
      return res.status(400).json({ message: 'Esse médico não atende nesse horário' });
    }

    const existingAppointment = await Appointment.findOne({ 
      where: { doctorId, date, hour, status: { [Op.ne]: 'cancelada' } }
    });
    if (existingAppointment) {
      return res.status(400).json({ message: 'Esse horário já está ocupado' });
    }

    const appointment = await Appointment.create({ 
      patientId, 
      doctorId, 
      date, 
      hour, 
      status: 'agendada' 
    });

    return res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao criar consulta', error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const appointment = await Appointment.findByPk(id, { include: { model: User, as: 'patient' } });
  if (!appointment) return res.status(404).json({ message: 'Consulta não encontrada' });

  if (req.user.role === 'medico') {
    if (req.user.id !== appointment.doctorId) {
      return res.status(403).json({ message: 'Somente o médico responsável pode atualizar' });
    }

    if (!['cancelada', 'confirmada', 'concluida'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido para médico' });
    }

    appointment.status = status;
    await appointment.save();
    return res.json(appointment);
  }

  if (req.user.role === 'paciente') {
    if (appointment.patientId !== req.user.id) {
      return res.status(403).json({ message: 'Você só pode cancelar suas próprias consultas' });
    }
    if (status !== 'cancelada') {
      return res.status(400).json({ message: 'Paciente só pode cancelar consultas' });
    }

    appointment.status = 'cancelada';
    await appointment.save();
    return res.json(appointment);
  }

  return res.status(403).json({ message: 'Acesso negado' });
};

exports.listByPatient = async (req, res) => {
  if (req.user.role !== 'paciente') {
    return res.status(403).json({ message: 'Somente pacientes podem ver seu histórico' });
  }
  const appointments = await Appointment.findAll({
    where: { patientId: req.user.id },
    include: [
      { model: User, as: 'doctor', attributes: ['id','name','email'], include: [{ model: Specialty, as: 'specialty' }] }
    ],
    order: [['createdAt', 'DESC']]
  });
  return res.json(appointments);
};

exports.listByDoctor = async (req, res) => {
  if (req.user.role !== 'medico') {
    return res.status(403).json({ message: 'Somente médicos podem ver seu histórico' });
  }

  const appointments = await Appointment.findAll({
    where: { doctorId: req.user.id },
    include: [
      { model: User, as: 'patient', attributes: ['id','name','email'] }
    ],
    order: [['createdAt', 'DESC']]
  });

  return res.json(appointments);
};