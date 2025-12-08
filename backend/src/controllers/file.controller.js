const { User } = require('../models');
const MedicalFile = require('../models/MedicalFile');


exports.sendFile = async (req, res) => {
  if (req.user.role !== 'medico') {
    return res.status(403).json({ message: 'Somente médicos podem enviar arquivos' });
  }

  const { patientId } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ message: 'Nenhum arquivo enviado' });

  const patient = await User.findByPk(patientId);
  if (!patient || patient.role !== 'paciente') {
    return res.status(400).json({ message: 'Paciente inválido' });
  }

  const medicalFile = MedicalFile.create({
    filename: file.originalname,
    path: file.path,
    doctorId: req.user.id,
    patientId: parseInt(patientId, 10)
  });

  medicalFile.doctor = { id: req.user.id, name: req.user.name, specialtyId: req.user.specialtyId };
  medicalFile.patient = { id: patient.id, name: patient.name };

  return res.status(201).json(medicalFile);
};

exports.listFilesForPatient = async (req, res) => {
  if (req.user.role !== 'paciente') {
    return res.status(403).json({ message: 'Somente pacientes podem ver seus arquivos' });
  }

  const files = MedicalFile.findAll({ where: { patientId: req.user.id } });

  for (const f of files) {
    const doctor = await User.findByPk(f.doctorId);
    if (doctor) {
      f.doctor = { id: doctor.id, name: doctor.name, specialtyId: doctor.specialtyId };
    }
    f.patient = { id: req.user.id, name: req.user.name };
  }

  return res.json(files);
};

exports.listFilesSentByDoctor = async (req, res) => {
  if (req.user.role !== 'medico') {
    return res.status(403).json({ message: 'Somente médicos podem ver seus arquivos enviados' });
  }

  const doctorId = parseInt(req.params.doctorId);
  const files = MedicalFile.findAll({ where: { doctorId } });

  for (const f of files) {
    const patient = await User.findByPk(f.patientId);
    if (patient) {
      f.patient = { id: patient.id, name: patient.name };
    }
    f.doctor = { id: req.user.id, name: req.user.name, specialtyId: req.user.specialtyId };
  }

  return res.json(files);
};
