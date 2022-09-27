const Validator = require('validator');
const validText = require('./validText');

module.exports = function validateCommentInput(
  taskId,
  commentId,
  userId,
  data
) {
  let errors = {};

  taskId = validText(taskId) ? taskId : '';
  commentId = validText(commentId) ? commentId : '';
  userId = validText(userId) ? userId : '';
  data.comment = validText(data.comment) ? data.comment : '';

  if (!Validator.isMongoId(taskId)) {
    errors.taskErr = 'Task ID is invalid';
  }

  if (commentId && !Validator.isMongoId(commentId)) {
    errors.commentErr = 'Comment ID is invalid';
  }

  if (!Validator.isMongoId(userId)) {
    errors.posterErr = 'Poster ID is invalid';
  }

  if (Validator.isEmpty(data.comment)) {
    errors.commentErr = 'Comment cannot be empty';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
