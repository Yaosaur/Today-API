const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');

const Comment = require('../models/comment');
const Task = require('../models/task');

const validateCommentInput = require('../utils/validation/comment');
const throwCommentErr = require('../utils/validation/throwCommentErr');
const ExpressError = require('../utils/ExpressError');

router.post(
  '/:taskId',
  passport.authenticate('jwt', { session: false }),
  catchAsync(async (req, res) => {
    const { errors, isValid } = validateCommentInput(
      req.params.taskId,
      null,
      req.user.id,
      req.body
    );

    throwCommentErr(errors, isValid);

    const newComment = await Comment.create({
      poster: req.user.id,
      comment: req.body.comment,
    });
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      {
        $push: { comments: newComment },
      },
      { new: true }
    )
      .populate('issuer assignedTo', '-_id firstName lastName email image')
      .populate({
        path: 'comments',
        populate: [
          { path: 'poster', select: '-_id firstName lastName email image' },
        ],
      });
    res.json(updatedTask);
  })
);

router.put(
  '/:taskId/:commentId',
  passport.authenticate('jwt', { session: false }),
  catchAsync(async (req, res, next) => {
    const { errors, isValid } = validateCommentInput(
      req.params.taskId,
      req.params.commentId,
      req.user.id,
      req.body
    );

    throwCommentErr(errors, isValid);

    const { taskId, commentId } = req.params;
    const comment = await Comment.findByIdAndUpdate(commentId, req.body);
    if (!comment) {
      next(new ExpressError('There is no comment with that Id', 404));
    }
    const task = await Task.findById(taskId).populate({
      path: 'comments',
      populate: [
        { path: 'poster', select: '-_id firstName lastName email image' },
      ],
    });
    if (!task) {
      next(new ExpressError('There is no task with that Id', 404));
    }
    res.json(task);
  })
);

router.delete(
  '/:taskId/:commentId',
  passport.authenticate('jwt', { session: false }),
  catchAsync(async (req, res, next) => {
    const { taskId, commentId } = req.params;
    const deletedComment = await Comment.findByIdAndRemove(commentId);
    const updatedTask = await Task.findByIdAndUpdate(taskId, {
      $pull: { comments: commentId },
    }).populate({
      path: 'comments',
      populate: [
        { path: 'poster', select: '-_id firstName lastName email image' },
      ],
    });
    if (!deletedComment) {
      return next(new ExpressError('That comment does not exist', 404));
    }
    res.json(updatedTask);
  })
);

module.exports = router;
