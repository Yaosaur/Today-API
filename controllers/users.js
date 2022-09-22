const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { fileUpload, fileDelete } = require('../utils/imageManipulation');

const User = require('../models/user');

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.find({}, '-_id -password -projects', (err, foundUsers) => {
      if (err) {
        throw new ExpressError();
      }
      res.json(foundUsers);
    });
  }
);

router.get(
  '/user/:email',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.find(
      { email: req.params.email },
      '-_id -password -projects',
      (err, foundUser) => {
        if (err) {
          throw new ExpressError();
        }
        res.json(foundUser);
      }
    );
  }
);

router.put(
  '/setPhoto',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const uploadSingle = fileUpload('today-profile-pictures').single('image');
    uploadSingle(
      req,
      res,
      catchAsync(async err => {
        const oldUserInfo = await User.findByIdAndUpdate(req.user.id, {
          image: req.file.location,
        });
        if (oldUserInfo.image) {
          fileDelete('today-profile-pictures', oldUserInfo.image);
        }
        res.json(req.file.location);
      })
    );
  }
);

module.exports = router;
