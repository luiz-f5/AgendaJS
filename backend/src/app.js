require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const { syncDatabase } = require('./models');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const scheduleRoutes = require('./routes/schedule.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const notificationRoutes = require('./routes/notification.routes');
const fileRoutes = require('./routes/file.routes');
const specialtyRoutes = require('./routes/specialty.routes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET","POST","PUT","PATCH","DELETE"],
  allowedHeaders: ["Content-Type","Authorization"]
}));


app.use(express.json());

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/schedules', scheduleRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/notifications', notificationRoutes);
app.use('/files', fileRoutes);
app.use('/specialties', specialtyRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));



module.exports = { app, syncDatabase };
