const ExpressError = require('../ExpressError');

module.exports = function throwTaskErr(errors, isValid) {
  const {
    projectErr,
    taskErr,
    titleErr,
    descriptionErr,
    deadlineErr,
    issuerErr,
    membersErr,
    priorityErr,
    typeErr,
  } = errors;

  if (!isValid) {
    if (projectErr) {
      throw new ExpressError(projectErr, 400);
    } else if (taskErr) {
      throw new ExpressError(taskErr, 400);
    } else if (titleErr) {
      throw new ExpressError(titleErr, 400);
    } else if (descriptionErr) {
      throw new ExpressError(descriptionErr, 400);
    } else if (deadlineErr) {
      throw new ExpressError(deadlineErr, 400);
    } else if (issuerErr) {
      throw new ExpressError(issuerErr, 400);
    } else if (membersErr) {
      throw new ExpressError(membersErr, 400);
    } else if (priorityErr) {
      throw new ExpressError(priorityErr, 400);
    } else if (typeErr) {
      throw new ExpressError(typeErr, 400);
    }
  }
};
