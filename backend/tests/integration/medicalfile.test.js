const request = require('supertest');
const fs = require('fs');
const path = require('path');
const { app } = require('../../src/app');
const { sequelize, User } = require('../../src/models');
const { hashPassword } = require('../../src/utils/password');

let doctorToken, patientToken, adminToken;
let doctorId, patientId, fileId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const doctorPassword = await hashPassword('medico123');
  const doctor = await User.create({
    name: 'Dr. Test',
    email: 'doctor@test.com',
    passwordHash: doctorPassword,
    role: 'medico'
  });
  doctorId = doctor.id;

  const patientPassword = await hashPassword('paciente123');
  const patient = await User.create({
    name: 'Patient Test',
    email: 'patient@test.com',
    passwordHash: patientPassword,
    role: 'paciente'
  });
  patientId = patient.id;

  const adminPassword = await hashPassword('admin123');
  await User.create({
    name: 'Admin Test',
    email: 'admin@test.com',
    passwordHash: adminPassword,
    role: 'admin'
  });

  const doctorRes = await request(app)
    .post('/auth/login')
    .send({ email: 'doctor@test.com', password: 'medico123' });
  doctorToken = doctorRes.body.token;

  const patientRes = await request(app)
    .post('/auth/login')
    .send({ email: 'patient@test.com', password: 'paciente123' });
  patientToken = patientRes.body.token;

  const adminRes = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@test.com', password: 'admin123' });
  adminToken = adminRes.body.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('MedicalFile API', () => {
  test('Médico consegue enviar PDF para paciente', async () => {
    const dummyPath = path.join(__dirname, 'dummy.pdf');
    fs.writeFileSync(dummyPath, 'conteudo teste');

    const res = await request(app)
      .post('/files/send')
      .set('Authorization', `Bearer ${doctorToken}`)
      .attach('pdf', dummyPath)
      .field('patientId', patientId);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('filename', 'dummy.pdf');
    expect(res.body).toHaveProperty('doctorId', doctorId);
    expect(res.body).toHaveProperty('patientId', patientId);
    fileId = res.body.id;

    fs.unlinkSync(dummyPath);
  });

  test('Paciente consegue listar seus arquivos', async () => {
    const res = await request(app)
      .get('/files/my-files')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('patientId', patientId);
  });

  test('Médico lista arquivos enviados', async () => {
    const res = await request(app)
      .get(`/files/sent/${doctorId}`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('doctorId', doctorId);
  });

  test('Paciente consegue baixar arquivo', async () => {
    const res = await request(app)
      .get(`/files/download/${fileId}`)
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toMatch(/attachment/);
  });

  test('Admin consegue listar todos os arquivos', async () => {
    const res = await request(app)
      .get('/files/all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('Admin consegue remover arquivo', async () => {
    const res = await request(app)
      .delete(`/files/remove/${fileId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});
