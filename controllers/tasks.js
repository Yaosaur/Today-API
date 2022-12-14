const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const User = require('../models/user');
const Project = require('../models/project');
const Task = require('../models/task');

const validateTaskInput = require('../utils/validation/tasks');
const throwTaskErr = require('../utils/validation/throwTaskErr');

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  catchAsync(async (req, res) => {
    const foundTasks = await Task.find({
      $or: [{ issuer: req.user.id }, { assignedTo: req.user.id }],
    })
      .populate('project', 'title')
      .populate('issuer assignedTo', '-_id firstName lastName email image');
    res.json(foundTasks);
  })
);

router.get(
  '/:taskId',
  passport.authenticate('jwt', { session: false }),
  catchAsync(async (req, res) => {
    const foundTask = await Task.findById(req.params.taskId)
      .populate('issuer assignedTo', '-_id firstName lastName email image')
      .populate({
        path: 'comments',
        populate: [
          { path: 'poster', select: '-_id firstName lastName email image' },
        ],
      });
    if (!foundTask) {
      throw new ExpressError('No task found for that ID.', 404);
    }
    res.json(foundTask);
  })
);

router.post(
  '/:projectId',
  passport.authenticate('jwt', { session: false }),
  catchAsync(async (req, res) => {
    const { errors, isValid } = validateTaskInput(
      req.params.projectId,
      null,
      req.body,
      req.user.id
    );

    throwTaskErr(errors, isValid);

    const arrayOfEmails = req.body.assignedTo.map(member => member.email);
    const membersId = await User.find({ email: { $in: arrayOfEmails } }, '_id');
    const newTask = await Task.create({
      ...req.body,
      project: req.params.projectId,
      dateCreated: new Date(),
      issuer: req.user.id,
      assignedTo: membersId,
    });
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.projectId,
      {
        $push: { tasks: { $each: [newTask], $position: 0 } },
      },
      { new: true }
    )
      .populate('creator members', '-_id firstName lastName email image')
      .populate({
        path: 'tasks',
        populate: [
          { path: 'issuer', select: '-_id firstName lastName email image' },
          { path: 'assignedTo', select: '-_id firstName lastName email image' },
        ],
      });
    res.json(updatedProject);
  })
);

router.put(
  '/:taskId',
  passport.authenticate('jwt', { session: false }),
  catchAsync(async (req, res) => {
    const { errors, isValid } = validateTaskInput(
      null,
      req.params.taskId,
      req.body,
      req.user.id
    );

    throwTaskErr(errors, isValid);

    const arrayOfEmails = req.body.assignedTo.map(member => member.email);
    const membersId = await User.find({ email: { $in: arrayOfEmails } }, '_id');
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      {
        ...req.body,
        assignedTo: membersId,
      },
      { new: true }
    ).populate('issuer assignedTo', '-_id firstName lastName email image');
    if (!updatedTask) {
      next(new ExpressError('There is no task with that Id', 404));
    }
    res.json(updatedTask);
  })
);

router.delete(
  '/:projectId/:taskId',
  passport.authenticate('jwt', { session: false }),
  catchAsync(async (req, res, next) => {
    const { projectId, taskId } = req.params;
    const deletedTask = await Task.findByIdAndRemove(taskId);
    const updatedProject = await Project.findByIdAndUpdate(projectId, {
      $pull: { tasks: taskId },
    })
      .populate('creator members', '-_id firstName lastName email image')
      .populate({
        path: 'tasks',
        populate: [
          { path: 'issuer', select: '-_id firstName lastName email image' },
          { path: 'assignedTo', select: '-_id firstName lastName email image' },
        ],
      });
    if (!deletedTask) {
      return next(new ExpressError('That task does not exist', 404));
    }
    res.json(updatedProject);
  })
);

module.exports = router;
