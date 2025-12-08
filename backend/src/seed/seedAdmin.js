require('dotenv').config();
const { sequelize, User } = require('../models');
const { hashPassword } = require('../utils/password');

async function seedAdmin() {
  try {
    await sequelize.authenticate();

    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error('Variáveis ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD devem estar no .env');
    }

    const existingAdmin = await User.findOne({ where: { email: ADMIN_EMAIL, role: 'admin' } });

    if (existingAdmin) {
      console.log('Admin já existe na database');
      return;
    }

    const passwordHash = await hashPassword(ADMIN_PASSWORD);

    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'admin'
    });

    console.log('Admin criado com sucesso:', admin.toJSON());
  } catch (err) {
    console.error('Erro ao criar admin:', err.message);
  } finally {
    await sequelize.close();
  }
}

seedAdmin();
