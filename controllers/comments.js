const express = require('express');
const router = express.Router();
const passport = require('passport');

const Comment = require('../models/comment');
const Task = require('../models/task');

router.post(
  '/:taskId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const newComment = await Comment.create({
      poster: req.user.id,
      published: new Date(),
      comment: req.body.comment,
    });
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      {
        $push: { comments: newComment },
      },
      { new: true }
    )
      .populate('issuer assignedTo', '-_id firstName lastName email')
      .populate({
        path: 'comments',
        populate: [{ path: 'poster', select: '-_id firstName lastName email' }],
      });
    res.json(updatedTask);
  }
);

router.put(
  '/:taskId/:commentId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { taskId, commentId } = req.params;
    await Comment.findByIdAndUpdate(commentId, req.body);
    const task = await Task.findById(taskId).populate({
      path: 'comments',
      populate: [{ path: 'poster', select: '-_id firstName lastName email' }],
    });
    res.json(task);
  }
);

router.delete(
  '/:taskId/:commentId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { taskId, commentId } = req.params;
    await Comment.findByIdAndRemove(commentId);
    const updatedTask = await Task.findByIdAndUpdate(taskId, {
      $pull: { comments: commentId },
    }).populate({
      path: 'comments',
      populate: [{ path: 'poster', select: '-_id firstName lastName email' }],
    });
    res.json(updatedTask);
  }
);

module.exports = router;
