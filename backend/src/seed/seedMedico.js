require('dotenv').config();
const { sequelize, User } = require('../models');
const { hashPassword } = require('../utils/password');

async function seedMedico() {
  try {
    await sequelize.authenticate();

    const MEDICO_NAME = "Doutor Teste";
    const MEDICO_EMAIL = "doutor@d.com";
    const MEDICO_PASSWORD = process.env.TEST_PW;
    if (!MEDICO_PASSWORD) {
      throw new Error("Variável de ambiente TEST_PW não definida");
    }

    const existingMedico = await User.findOne({ where: { email: MEDICO_EMAIL, role: 'medico' } });

    if (existingMedico) {
      console.log('Médico já existe na database');
      return;
    }

    const passwordHash = await hashPassword(MEDICO_PASSWORD);

    const medico = await User.create({
      name: MEDICO_NAME,
      email: MEDICO_EMAIL,
      passwordHash,
      role: 'medico'
    });

    console.log('Médico criado com sucesso:', medico.toJSON());
  } catch (err) {
    console.error('Erro ao criar médico:', err.message);
  } finally {
    await sequelize.close();
  }
}

seedMedico();
