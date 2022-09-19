const express = require('express');
const router = express.Router();
const passport = require('passport');

const Message = require('../models/message');
const User = require('../models/user');

router.get(
  '/:email',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const receiver = await User.findOne({ email: req.params.email }, 'id');
    const messages = await Message.find({
      users: { $all: [receiver._id, req.user._id] },
    })
      .sort({ updatedAt: 1 })
      .populate('sender users', '-_id firstName lastName email image');
    res.json(messages);
  }
);

// router.post(
//   '/',
//   passport.authenticate('jwt', { session: false }),
//   async (req, res) => {
//     console.log(newMessage);
//   }
// );

module.exports = router;
