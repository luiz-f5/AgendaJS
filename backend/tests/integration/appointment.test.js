const request = require('supertest');
const { app } = require('../../src/app');
const { sequelize, User, Schedule, Specialty } = require('../../src/models');
const { hashPassword } = require('../../src/utils/password');

let doctorToken, patientToken, doctorId, patientId, specialtyId, appointmentId;

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

  await Schedule.create({ doctorId, hour: '09:00', available: true });

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

describe('Appointment API', () => {
  test('Paciente consegue marcar consulta em horário disponível', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); 

    const res = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ doctorId, specialtyId, date: futureDate.toISOString().split('T')[0], hour: '09:00' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('status', 'agendada');
    appointmentId = res.body.id;
  });

  test('Paciente não consegue marcar em horário indisponível', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const res = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ doctorId, specialtyId, date: futureDate.toISOString().split('T')[0], hour: '09:00' });

    expect(res.status).toBe(400);
  });

  test('Paciente consegue cancelar sua própria consulta', async () => {
    const res = await request(app)
      .patch(`/appointments/${appointmentId}/status`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ status: 'cancelada' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'cancelada');
  });

  test('Médico consegue concluir consulta (após paciente remarcar)', async () => {
    await Schedule.create({ doctorId, hour: '10:00', available: true });

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);

    const resCreate = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ doctorId, specialtyId, date: futureDate.toISOString().split('T')[0], hour: '10:00' });
    const newAppointmentId = resCreate.body.id;

    const resUpdate = await request(app)
      .patch(`/appointments/${newAppointmentId}/status`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ status: 'concluida' });

    expect(resUpdate.status).toBe(200);
    expect(resUpdate.body).toHaveProperty('status', 'concluida');
  });

  test('Paciente vê seu histórico', async () => {
    const res = await request(app)
      .get('/appointments/history/patient')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('patientId', patientId);
    expect(res.body[0]).toHaveProperty('doctor'); 
  });

  test('Médico vê seu histórico', async () => {
    const res = await request(app)
      .get('/appointments/history/doctor')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('doctorId', doctorId);
    expect(res.body[0]).toHaveProperty('patient');
  });
});
