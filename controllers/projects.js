const express = require('express');
const router = express.Router();
const passport = require('passport');

const User = require('../models/user');
const Project = require('../models/project');
const Task = require('../models/task');

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const foundProjects = await Project.find({
      $or: [{ creator: req.user.id }, { members: req.user.id }],
    })
      .populate('creator members', '-_id firstName lastName email')
      .populate({
        path: 'tasks',
        populate: [
          { path: 'issuer', select: '-_id firstName lastName email' },
          { path: 'assignedTo', select: '-_id firstName lastName email' },
        ],
      });
    res.json(foundProjects);
  }
);

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const foundProjects = await Project.findById(req.params.id)
      .populate('creator members', '-_id firstName lastName email')
      .populate({
        path: 'tasks',
        populate: [
          { path: 'issuer', select: '-_id firstName lastName email' },
          { path: 'assignedTo', select: '-_id firstName lastName email' },
        ],
      });
    res.json(foundProjects);
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const arrayOfEmails = req.body.members.map(member => member.email);
    const membersId = await User.find({ email: { $in: arrayOfEmails } }, '_id');
    Project.create(
      { ...req.body, members: membersId, creator: req.user.id },
      (err, createdProject) => {
        res.json(createdProject);
      }
    );
  }
);

router.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const arrayOfEmails = req.body.members.map(member => member.email);
    const membersId = await User.find({ email: { $in: arrayOfEmails } }, '_id');
    const editedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, members: membersId },
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
    res.json(editedProject);
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Project.findByIdAndRemove(req.params.id, (err, removedProject) => {
      res.json(removedProject);
    });
  }
);

router.post(
  '/:id/task',
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
      { $push: { tasks: newTask._id } },
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
