const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { sequelize, User } = require('../../src/models');
const auth = require('../../src/middlewares/auth');
const { requireRole } = require('../../src/middlewares/roles');
const { hashPassword } = require('../../src/utils/password');

let doctorToken;
let patientToken;

beforeAll(async () => {
  await sequelize.sync({ force: true });
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

  doctorToken = jwt.sign({ id: doctor.id, role: doctor.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  patientToken = jwt.sign({ id: patient.id, role: patient.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await sequelize.close();
});

const app = express();
app.get('/protected', auth, (req, res) => {
  res.json({ message: `Olá ${req.user.name}`, role: req.user.role });
});
app.get('/doctor-only', auth, requireRole('medico'), (req, res) => {
  res.json({ message: 'Acesso médico liberado' });
});

describe('Middleware auth', () => {
  test('Bloqueia requisição sem token', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
  });

  test('Bloqueia requisição com token inválido', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer token_invalido');
    expect(res.status).toBe(401);
  });

  test('Permite requisição com token válido', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${doctorToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('role', 'medico');
  });
});

describe('Middleware requireRole', () => {
  test('Bloqueia paciente em rota de médico', async () => {
    const res = await request(app)
      .get('/doctor-only')
      .set('Authorization', `Bearer ${patientToken}`);
    expect(res.status).toBe(403);
  });

  test('permite médico em rota de médico', async () => {
    const res = await request(app)
      .get('/doctor-only')
      .set('Authorization', `Bearer ${doctorToken}`);
    expect(res.status).toBe(200);
  });
});
