require('dotenv').config();
const { sequelize, User } = require('../models');
const { hashPassword } = require('../utils/password');

async function seedPaciente() {
  try {
    await sequelize.authenticate();

    const PACIENTE_NAME = "Paciente Test";
    const PACIENTE_EMAIL = "paciente@p.com";
    const PACIENTE_PASSWORD = process.env.TEST_PW; 

    if (!PACIENTE_PASSWORD) {
      throw new Error("Variável de ambiente TEST_PW não definida");
    }

    const existingPaciente = await User.findOne({ where: { email: PACIENTE_EMAIL, role: 'paciente' } });

    if (existingPaciente) {
      console.log('Paciente já existe na database');
      return;
    }

    const passwordHash = await hashPassword(PACIENTE_PASSWORD);

    const paciente = await User.create({
      name: PACIENTE_NAME,
      email: PACIENTE_EMAIL,
      passwordHash,
      role: 'paciente'
    });

    console.log('Paciente criado com sucesso:', paciente.toJSON());
  } catch (err) {
    console.error('Erro ao criar paciente:', err.message);
  } finally {
    await sequelize.close();
  }
}

seedPaciente();

