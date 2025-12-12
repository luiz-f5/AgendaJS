const { sequelize, User } = require('../../src/models');
const { hashPassword } = require('../../src/utils/password');

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const passwordHash = await hashPassword('123456');
  await User.create({
    name: 'AdminTest',
    email: 'admin@test.com',
    passwordHash,
    role: 'admin'
  });
});

afterAll(async () => {
  await sequelize.close();
});
