const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const passport = require('../config/passport');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').isString().isLength({ min: 2 }),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  authController.login
);

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const { token, user } = req.user;
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}&id=${user.id}`);
  }
);

module.exports = router;
