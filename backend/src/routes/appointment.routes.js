const express = require('express');
const appointmentController = require('../controllers/appointment.controller');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, appointmentController.create);
router.patch('/:id/status', auth, appointmentController.updateStatus);
router.get('/history/patient', auth, appointmentController.listByPatient);
router.get('/history/doctor', auth, appointmentController.listByDoctor);

module.exports = router;
