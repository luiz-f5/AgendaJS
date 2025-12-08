const bcrypt = require('bcrypt');
const rounds = Number(process.env.BCRYPT_ROUNDS || 10);

async function hashPassword(plain) {
  return bcrypt.hash(plain, rounds);
}

async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { hashPassword, comparePassword };
