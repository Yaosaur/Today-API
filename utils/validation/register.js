const Validator = require('validator');
const validText = require('./validText');

module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.firstName = validText(data.firstName) ? data.firstName : '';
  data.lastName = validText(data.lastName) ? data.lastName : '';
  data.email = validText(data.email) ? data.email : '';
  data.password = validText(data.password) ? data.password : '';

  if (Validator.isEmpty(data.firstName)) {
    errors.firstNameErr = 'First name is required';
  }

  if (Validator.isEmpty(data.lastName)) {
    errors.lastNameErr = 'Last name is required';
  }

  if (Validator.isEmpty(data.email)) {
    errors.emailErr = 'Email is required';
  }

  if (!Validator.isEmail(data.email)) {
    errors.emailErr = 'Email is invalid';
  }

  if (Validator.isEmpty(data.password)) {
    errors.passwordErr = 'Password is required';
  }

  if (!Validator.isLength(data.password, { min: 6 })) {
    errors.passwordErr = 'Password must be at least 6 characters';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
