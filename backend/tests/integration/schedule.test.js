const request = require('supertest');
const { app } = require('../../src/app');
const { sequelize, User, Appointment, Schedule, Specialty } = require('../../src/models');
const { hashPassword } = require('../../src/utils/password');

let doctorToken;
let patientToken;
let doctorId;
let patientId;
let specialtyId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const specialty = await Specialty.create({ name: 'Clínico Geral' });
  specialtyId = specialty.id;

  const doctorPassword = await hashPassword('medico123');
  const doctor = await User.create({
    name: 'Dr. Test',
    email: 'doctor@test.com',
    passwordHash: doctorPassword,
    role: 'medico',
    specialtyId
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

describe('Schedule API', () => {
  test('Paciente não pode criar horario', async () => {
    const res = await request(app)
      .post('/schedules/bulk')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ selectedHours: ['09:00', '10:00'] });

    expect(res.status).toBe(403);
  });

  test('Médico pode criar horários válidos', async () => {
    const res = await request(app)
      .post('/schedules/bulk')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ selectedHours: ['09:00', '10:00', '18:00'] }); 

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2); 
    expect(res.body[0]).toHaveProperty('hour', '09:00');
    expect(res.body[1]).toHaveProperty('hour', '10:00');
  });

  test('Listar todos horários do médico', async () => {
    const res = await request(app)
      .get(`/schedules/${doctorId}`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body.some(s => s.hour === '09:00')).toBe(true);
  });
});
