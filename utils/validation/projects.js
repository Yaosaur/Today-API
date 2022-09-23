const Validator = require('validator');
const validText = require('./validText');

module.exports = function validateProjectInput(data, userId) {
  let errors = {};

  data.title = validText(data.title) ? data.title : '';
  data.description = validText(data.description) ? data.description : '';
  userId = validText(userId) ? userId : '';

  if (Validator.isEmpty(data.title)) {
    errors.titleErr = 'Title is required';
  }

  if (Validator.isEmpty(data.description)) {
    errors.descriptionErr = 'Description is required';
  }

  if (!Validator.isMongoId(userId)) {
    errors.creatorErr = 'Creator is invalid';
  }

  if (!Array.isArray(data.members)) {
    errors.membersErr = 'Members data is invalid';
  } else {
    for (let member of data.members) {
      if (!Validator.isEmail(member.email)) {
        errors.membersErr = 'Members email is required';
        break;
      }
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
