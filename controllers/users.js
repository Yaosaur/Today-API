const express = require('express');
const router = express.Router();
const passport = require('passport');
const imageUpload = require('../middleware/imageUpload');

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

router.put(
  '/setPhoto',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const uploadSingle = imageUpload('today-profile-pictures').single('image');
    uploadSingle(req, res, async err => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      await User.findByIdAndUpdate(req.user.id, { image: req.file.location });
      res.json(req.file.location);
    });
  }
);

module.exports = router;
