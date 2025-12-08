const express = require('express');
const specialtyController = require('../controllers/specialty.controller');
const auth = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');

const router = express.Router();

router.get('/', auth, specialtyController.list);

router.post('/', auth, requireRole('admin'), specialtyController.create);

router.delete('/:id', auth, requireRole('admin'), specialtyController.remove);

module.exports = router;