const express = require('express');
const scheduleController = require('../controllers/schedule.controller');
const auth = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');

const router = express.Router();

router.post('/bulk', auth, requireRole('medico'), scheduleController.createOrUpdateSlots);
router.get('/:doctorId', auth, scheduleController.listByDoctor);
router.get('/:doctorId/available', auth, scheduleController.listAvailableByDoctor);
module.exports = router;
