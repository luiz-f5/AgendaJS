const request = require('supertest');
const { app } = require('../../src/app');
let adminToken;

describe('Users API', () => {
  beforeAll(async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: '123456' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    adminToken = res.body.token;
  });

  test('Admin não pode criar outro admin', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Novo Admin',
        email: 'novo-admin@test.com', 
        password: '123456',
        role: 'admin'
      });

    expect(res.status).toBe(403);
  });

  test('Admin pode criar médico', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Dr. House',
        email: 'house.unique@test.com',
        password: '123456',
        role: 'medico'
      });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe('medico');
    expect(res.body).toHaveProperty('id');
  });
});
