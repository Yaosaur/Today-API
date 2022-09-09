const express = require('express');
const router = express.Router({ mergeParams: true });
const passport = require('passport');

const User = require('../models/user');
const Project = require('../models/project');
const Task = require('../models/task');

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const arrayOfEmails = req.body.assignedTo.map(member => member.email);
    const membersId = await User.find({ email: { $in: arrayOfEmails } }, '_id');
    const newTask = await Task.create({
      ...req.body,
      dateCreated: new Date(),
      issuer: req.user.id,
      assignedTo: membersId,
      status: 'In Progress',
    });
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        $push: { tasks: { $each: [newTask], $position: 0 } },
      },
      { new: true }
    )
      .populate('creator members', '-_id firstName lastName email')
      .populate({
        path: 'tasks',
        populate: [
          { path: 'issuer', select: '-_id firstName lastName email' },
          { path: 'assignedTo', select: '-_id firstName lastName email' },
        ],
      });
    res.json(updatedProject);
  }
);

module.exports = router;
