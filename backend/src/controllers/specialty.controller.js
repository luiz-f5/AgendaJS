const { Specialty } = require('../models');

exports.list = async (_req, res) => {
  const specialties = await Specialty.findAll();
  return res.json(specialties);
};

exports.create = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Nome é obrigatório' });

  const specialty = await Specialty.create({ name });
  return res.status(201).json(specialty);
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  await Specialty.destroy({ where: { id } });
  return res.json({ message: 'Especialidade removida' });
};

exports.setSpecialty = async (req, res) => {
    if (req.user.role !== 'medico') return res.status(403).json({ message: 'Somente médicos podem escolher especialidade' });
    const { specialtyId } = req.body;
    const doctor = await User.findByPk(req.user.id);
    doctor.specialtyId = specialtyId;
    await doctor.save();
    return res.json(doctor);
  };

  