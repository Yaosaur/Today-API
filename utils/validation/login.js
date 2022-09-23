const Validator = require('validator');
const validText = require('./validText');

module.exports = function validateLoginInput(data) {
  let errors = {};

  data.email = validText(data.email) ? data.email : '';
  data.password = validText(data.password) ? data.password : '';

  if (!Validator.isEmail(data.email)) {
    errors.emailErr = 'Email is invalid';
  }

  if (Validator.isEmpty(data.email)) {
    errors.emailErr = 'Email is required';
  }

  if (Validator.isEmpty(data.password)) {
    errors.passwordErr = 'Password is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
