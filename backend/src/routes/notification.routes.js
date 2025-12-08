const express = require('express');
const notificationController = require('../controllers/notification.controller');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/admin/send', auth, notificationController.sendByAdmin);
router.post('/doctor/send', auth, notificationController.sendByDoctor);
router.get('/patient/my', auth, notificationController.listForPatient);
router.get('/doctor/my', auth, notificationController.listForDoctor);
router.get('/admin/all', auth, notificationController.listAll);
router.get("/doctor/sent", auth, notificationController.listSentByDoctor);

module.exports = router;
