const ExpressError = require('../ExpressError');

module.exports = function throwCommentErr(errors, isValid) {
  const { taskErr, posterErr, commentErr } = errors;

  if (!isValid) {
    if (taskErr) {
      throw new ExpressError(taskErr, 400);
    } else if (posterErr) {
      throw new ExpressError(posterErr, 400);
    } else if (commentErr) {
      throw new ExpressError(commentErr, 400);
    }
  }
};
