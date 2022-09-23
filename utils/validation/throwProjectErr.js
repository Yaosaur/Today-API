const ExpressError = require('../ExpressError');

module.exports = function throwProjectErr(errors, isValid) {
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
};
