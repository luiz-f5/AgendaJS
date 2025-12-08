require('dotenv').config();
const mysql = require('mysql2/promise');
const { sequelize } = require('../models');

async function init() {
  try {
    const { DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT } = process.env;

    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASS
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await connection.end();
    console.log(`Banco ${DB_NAME} garantido.`);

    await sequelize.sync({ alter: true });
    console.log('Tabelas sincronizadas com sucesso.');

    process.exit(0);
  } catch (err) {
    console.error('Erro ao inicializar banco:', err.message);
    process.exit(1);
  }
}

init();
