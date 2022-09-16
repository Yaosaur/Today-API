const express = require('express');
const router = express.Router();
const passport = require('passport');
const { fileUpload, fileDelete } = require('../middleware/imageManipulation');

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

router.get(
  '/user',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findById(req.user.id, '-_id -password -projects', (err, foundUser) => {
      res.json(foundUser);
    });
  }
);

router.put(
  '/setPhoto',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const uploadSingle = fileUpload('today-profile-pictures').single('image');
    uploadSingle(req, res, async err => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      const oldUserInfo = await User.findByIdAndUpdate(req.user.id, {
        image: req.file.location,
      });
      if (oldUserInfo.image) {
        fileDelete('today-profile-pictures', oldUserInfo.image);
      }
      res.json(req.file.location);
    });
  }
);

module.exports = router;
