const request = require('supertest');
const { app } = require('../../src/app');
const { sequelize, User } = require('../../src/models');
const { hashPassword } = require('../../src/utils/password');

let adminToken, doctorToken, patientToken, patientId;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  
  const adminPassword = await hashPassword('123456');
  const admin = await User.create({
    name: 'Admin Test',
    email: 'admin@test.com',
    passwordHash: adminPassword,
    role: 'admin'
  });

  const doctorPassword = await hashPassword('medico123');
  const doctor = await User.create({
    name: 'Dr. Test',
    email: 'doctor@test.com',
    passwordHash: doctorPassword,
    role: 'medico'
  });

  const patientPassword = await hashPassword('paciente123');
  const patient = await User.create({
    name: 'Patient Test',
    email: 'patient@test.com',
    passwordHash: patientPassword,
    role: 'paciente'
  });
  patientId = patient.id;

  const adminRes = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@test.com', password: '123456' });
  adminToken = adminRes.body.token;

  const doctorRes = await request(app)
    .post('/auth/login')
    .send({ email: 'doctor@test.com', password: 'medico123' });
  doctorToken = doctorRes.body.token;

  const patientRes = await request(app)
    .post('/auth/login')
    .send({ email: 'patient@test.com', password: 'paciente123' });
  patientToken = patientRes.body.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Notification API', () => {
  test('Admin envia notificação geral', async () => {
    const res = await request(app)
      .post('/notifications/admin/send')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        subject: 'gfdg',
        message: 'ggfdgdfgd',
        scope: 'todos'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('scope', 'todos');
    expect(res.body).toHaveProperty('senderName', 'Admin');
  });

  test('medico envia notificação para paciente', async () => {
    const res = await request(app)
      .post('/notifications/doctor/send')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        subject: 'paciente mesangem',
        message: 'sdfsdfsdfsfsf',
        patientId
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('scope', 'user');
    expect(res.body).toHaveProperty('targetUserId', patientId);
  });

  test('Paciente lista suas notificações', async () => {
    const res = await request(app)
      .get('/notifications/patient/my')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(n => n.scope === 'todos')).toBe(true);
    expect(res.body.some(n => n.targetUserId === patientId)).toBe(true);
  });

  test('Admin lista todas as notificações', async () => {
    const res = await request(app)
      .get('/notifications/admin/all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });
});
