const { validationResult } = require('express-validator');
const { User, Specialty } = require('../models');
const { hashPassword } = require('../utils/password');

exports.list = async (req, res) => {
  const { role } = req.query;
  if (role === 'medico') {
    const doctors = await User.findAll({ where: { role: 'medico' }, attributes: ['id','name','email'] });
    return res.json(doctors);
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Somente admin pode listar todos os usuários' });
  }
  const users = await User.findAll();
  return res.json(users);
};

exports.getById = async (req, res) => {
  const user = await User.findByPk(req.params.id, { attributes: ['id', 'name', 'email', 'role'] });
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  return res.json(user);
};

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role } = req.body;
  if (!password) {
    return res.status(400).json({ message: 'Senha obrigatória' });
  }

  if (role === 'admin') {
    return res.status(403).json({ message: 'Admins não podem criar outros admins' });
  }

  try {
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email já cadastrado' });

    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, passwordHash, role: role ?? null });
    return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao criar usuário', error: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

  if (role === 'admin') {
    return res.status(403).json({ message: 'Admins não podem atribuir ou editar papel de admin' });
  }

  if (req.user.role === 'admin' && req.user.id === user.id && typeof role !== 'undefined') {
    return res.status(403).json({ message: 'Admin não pode alterar seu próprio papel' });
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (typeof role !== 'undefined') user.role = role;
  if (password) user.passwordHash = await hashPassword(password);

  await user.save();
  return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

  if (user.role === 'admin') {
    return res.status(403).json({ message: 'Admins não podem excluir outros admins' });
  }

  if (req.user.role === 'admin' && req.user.id === user.id) {
    return res.status(403).json({ message: 'Admin não pode excluir a si mesmo' });
  }

  await user.destroy();
  return res.status(204).send();
};


exports.assignRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body; 
  
  if (role === 'admin') {
    return res.status(403).json({ message: 'Admins não podem atribuir papel de admin' });
  }

  if (!['medico', 'paciente'].includes(role)) {
    return res.status(400).json({ message: 'Role inválida. Use "medico" ou "paciente".' });
  }

  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  user.role = role;
  await user.save();
  return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
};

exports.listDoctors = async (req, res) => {
  try {
    const { specialtyId } = req.query;
    const where = { role: 'medico' };
    if (specialtyId) {
      where.specialtyId = specialtyId;
    }

    const doctors = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'specialtyId'],
      include: [
        { model: Specialty, as: 'specialty', attributes: ['id', 'name'] }
      ]
    });

    return res.json(doctors);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao listar médicos', error: error.message });
  }
};

exports.setSpecialty = async (req, res) => {
  try {
    if (req.user.role !== 'medico') {
      return res.status(403).json({ message: 'Somente médicos podem escolher especialidade' });
    }

    const { specialtyId } = req.body;
    const doctor = await User.findByPk(req.user.id);
    if (!doctor) return res.status(404).json({ message: 'Médico não encontrado' });

    doctor.specialtyId = specialtyId;
    await doctor.save();

    return res.json({ id: doctor.id, name: doctor.name, email: doctor.email, specialtyId: doctor.specialtyId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao definir especialidade', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id','name','email','role','specialtyId'],
    include: [{ model: Specialty, as: 'specialty' }]
  });
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  res.json(user);
};