require('dotenv').config();
const { sequelize, Specialty } = require('../models');

async function seedSpecialty() {
  try {
    await sequelize.authenticate();

    const specialties = [
      'Cardiologia',
      'Radiologia',
      'Odontologia',
      'Dermatologia',
      'Fisioterapia'
    ];

    for (const name of specialties) {
      const existing = await Specialty.findOne({ where: { name } });
      if (existing) {
        console.log(`Especialidade ${name} já existe`);
        continue;
      }
      await Specialty.create({ name });
      console.log(`Especialidade ${name} criada com sucesso`);
    }
  } catch (err) {
    console.error('Erro ao criar especialidades:', err.message);
  } finally {
    await sequelize.close();
  }
}

seedSpecialty();
