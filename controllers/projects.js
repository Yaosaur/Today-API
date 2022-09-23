const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const User = require('../models/user');
const Project = require('../models/project');

const validateProjectInput = require('../utils/validation/projects');

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  catchAsync(async (req, res) => {
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
  })
);

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  catchAsync(async (req, res, next) => {
    const foundProject = await Project.findById(req.params.id)
      .populate('creator members', '-_id firstName lastName email')
      .populate({
        path: 'tasks',
        populate: [
          { path: 'issuer', select: '-_id firstName lastName email' },
          { path: 'assignedTo', select: '-_id firstName lastName email' },
        ],
      });
    if (!foundProject) {
      throw new ExpressError('No project found for that ID.', 404);
    }
    res.json(foundProject);
  })
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  catchAsync(async (req, res) => {
    const { errors, isValid } = validateProjectInput(req.body, req.user.id);
    const { titleErr, descriptionErr, creatorErr, membersErr } = errors;

    if (!isValid) {
      if (titleErr) {
        throw new ExpressError(titleErr, 400);
      } else if (descriptionErr) {
        throw new ExpressError(descriptionErr, 400);
      } else if (creatorErr) {
        throw new ExpressError(creatorErr, 400);
      } else if (membersErr) {
        throw new ExpressError(membersErr, 400);
      }
    }

    const arrayOfEmails = req.body.members.map(member => member.email);
    const membersId = await User.find({ email: { $in: arrayOfEmails } }, '_id');
    Project.create(
      { ...req.body, members: membersId, creator: req.user.id },
      (err, createdProject) => {
        res.json(createdProject);
      }
    );
  })
);

router.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  catchAsync(async (req, res) => {
    const { errors, isValid } = validateProjectInput(req.body, req.user.id);
    const { titleErr, descriptionErr, creatorErr, membersErr } = errors;

    if (!isValid) {
      if (titleErr) {
        throw new ExpressError(titleErr, 400);
      } else if (descriptionErr) {
        throw new ExpressError(descriptionErr, 400);
      } else if (creatorErr) {
        throw new ExpressError(creatorErr, 400);
      } else if (membersErr) {
        throw new ExpressError(membersErr, 400);
      }
    }

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
    if (!editedProject) {
      throw new ExpressError('No project found for that ID.', 404);
    }
    res.json(editedProject);
  })
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    Project.findByIdAndRemove(req.params.id, (err, removedProject) => {
      if (err) {
        return next(new ExpressError());
      }
      res.json(removedProject);
    });
  }
);

module.exports = router;
