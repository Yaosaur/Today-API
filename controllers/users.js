const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Validator = require('validator');
//S3 account no longer active - Legacy code is no longer being used in project
//Import methods to upload and delete images in S3 bucket
// const {
//   fileUpload,
//   fileDelete,
// } = require('../utils/imageManipulation');

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
  (req, res, next) => {
    if (!Validator.isEmail(req.params.email)) {
      throw new ExpressError('Email is invalid', 400);
    }

    User.find(
      { email: req.params.email },
      '-_id -password -projects',
      (err, foundUser) => {
        if (err) {
          return next(new ExpressError());
        } else if (foundUser.length === 0) {
          return next(new ExpressError('No users found', 404));
        }
        res.json(foundUser);
      }
    );
  }
);

//S3 account no longer active - Legacy code is no longer being used in project
//Route to change user's photos in S3 and update MongoDB with the new image URL for the user
// router.put(
//   '/setPhoto',
//   passport.authenticate('jwt', { session: false }),
//   (req, res, next) => {
//     const key = Date.now().toString();
//     const uploadSingle = fileUpload('today-profile-pictures', key).single(
//       'image'
//     );
//     uploadSingle(
//       req,
//       res,
//       catchAsync(async err => {
//         const location = `https://today-profile-pictures.s3.amazonaws.com/${key}`;
//         const oldUserInfo = await User.findByIdAndUpdate(req.user.id, {
//           image: location,
//         });
//         if (!oldUserInfo) {
//           next(new ExpressError('No user found', 404));
//         }
//         if (oldUserInfo.image) {
//           fileDelete('today-profile-pictures', oldUserInfo.image);
//         }
//         res.json(location);
//       })
//     );
//   }
// );

module.exports = router;
