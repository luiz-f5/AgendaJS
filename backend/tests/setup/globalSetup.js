const mysql = require('mysql2/promise');
require('dotenv').config();

module.exports = async () => {
  const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASS,
    DB_NAME_TEST
  } = process.env;

  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME_TEST}\`;`);

  await connection.end();
};
