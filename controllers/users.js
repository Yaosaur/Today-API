const express = require('express');
const router = express.Router();
const passport = require('passport');

const User = require('../models/user');

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.find({}, '-_id -password -projects', (err, foundUsers) => {
      res.json(foundUsers);
    });
  }
);

module.exports = router;
