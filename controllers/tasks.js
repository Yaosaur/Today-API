const express = require('express');
const router = express.Router({ mergeParams: true });
const passport = require('passport');

const User = require('../models/user');
const Project = require('../models/project');
const Task = require('../models/task');

router.get(
  '/:taskId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const foundTask = await Task.findById(req.params.taskId).populate(
      'issuer assignedTo',
      '-_id firstName lastName email'
    );
    res.json(foundTask);
  }
);

router.post(
  '/:projectId',
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
      req.params.projectId,
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

router.put(
  '/:taskId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const arrayOfEmails = req.body.assignedTo.map(member => member.email);
    const membersId = await User.find({ email: { $in: arrayOfEmails } }, '_id');
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      {
        ...req.body,
        assignedTo: membersId,
      },
      { new: true }
    ).populate('issuer assignedTo', '-_id firstName lastName email');
    res.json(updatedTask);
  }
);

router.delete(
  '/:projectId/:taskId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { projectId, taskId } = req.params;
    await Task.findByIdAndRemove(taskId);
    const updatedProject = await Project.findByIdAndUpdate(projectId, {
      $pull: { tasks: taskId },
    })
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
