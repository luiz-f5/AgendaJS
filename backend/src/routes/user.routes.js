const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const { User } = require('../models'); 

const router = express.Router();

router.get('/doctors', auth, userController.listDoctors);

router.get('/patients', auth, async (req, res) => {
  const patients = await User.findAll({ 
    where: { role: 'paciente' }, 
    attributes: ['id','name','email'] 
  });
  res.json(patients);
});

router.patch('/me/specialty', auth, userController.setSpecialty);

router.get('/me', auth, userController.getMe);

router.use(auth, requireRole('admin'));

router.get('/', userController.list);
router.get('/:id', userController.getById);

router.post(
  '/',
  [
    body('name').isString().isLength({ min: 2 }),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['admin', 'medico', 'paciente', null]),
  ],
  userController.create
);

router.put(
  '/:id',
  [
    body('name').optional().isString().isLength({ min: 2 }),
    body('email').optional().isEmail(),
    body('password').optional().isLength({ min: 6 }),
    body('role').optional().isIn(['admin', 'medico', 'paciente', null]),
  ],
  userController.update
);

router.delete('/:id', userController.remove);

router.patch(
  '/:id/role',
  [body('role').isIn(['medico', 'paciente'])],
  userController.assignRole
);


module.exports = router;
