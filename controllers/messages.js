const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const Message = require('../models/message');
const User = require('../models/user');

router.get(
  '/:email',
  passport.authenticate('jwt', { session: false }),
  catchAsync(async (req, res) => {
    const receiver = await User.findOne({ email: req.params.email }, 'id');
    if (!receiver) {
      throw new ExpressError(
        'The user your are messaging does not exist.',
        404
      );
    }
    const messages = await Message.find({
      users: { $all: [receiver._id, req.user._id] },
    })
      .sort({ updatedAt: 1 })
      .populate('sender users', '-_id firstName lastName email image');
    res.json(messages);
  })
);

module.exports = router;
