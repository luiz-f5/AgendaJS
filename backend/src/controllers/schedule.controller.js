const { Schedule } = require('../models');

exports.createOrUpdateSlots = async (req, res) => {
  const doctorId = req.user.id;
  const { selectedHours } = req.body;

  if (req.user.role !== 'medico') {
    return res.status(403).json({ message: 'Somente médicos podem gerenciar horários' });
  }

  const allowedHours = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];

  await Schedule.destroy({ where: { doctorId } });

  const schedules = await Promise.all(
    selectedHours.map(hour => {
      if (!allowedHours.includes(hour)) return null;
      return Schedule.create({ doctorId, hour });
    })
  );

  return res.json(schedules.filter(Boolean));
};

exports.listByDoctor = async (req, res) => {
  const doctorId = req.params.doctorId;
  const schedules = await Schedule.findAll({ where: { doctorId } });
  return res.json(schedules);
};

exports.listAvailableByDoctor = async (req, res) => {
  const doctorId = req.params.doctorId;
  const { date } = req.query;

  const schedules = await Schedule.findAll({ 
    where: { doctorId, date },
    include: ['appointment']
  });

  const available = schedules.filter(s => !s.appointment || s.appointment.status === 'cancelada');

  return res.json(available);
};