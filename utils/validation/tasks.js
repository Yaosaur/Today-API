const Validator = require('validator');
const validText = require('./validText');

module.exports = function validateTaskInput(projectId, taskId, data, userId) {
  let errors = {};

  projectId = validText(projectId) ? projectId : '';
  taskId = validText(taskId) ? taskId : '';
  data.title = validText(data.title) ? data.title : '';
  data.description = validText(data.description) ? data.description : '';
  userId = validText(userId) ? userId : '';
  data.deadline = validText(data.deadline) ? data.deadline : '';
  data.priority = validText(data.priority) ? data.priority : '';
  data.status = validText(data.status) ? data.status : '';
  data.type = validText(data.type) ? data.type : '';

  if (projectId && !Validator.isMongoId(projectId)) {
    errors.projectErr = 'Project ID is invalid';
  }

  if (taskId && !Validator.isMongoId(taskId)) {
    errors.taskErr = 'Task ID is invalid';
  }

  if (Validator.isEmpty(data.title)) {
    errors.titleErr = 'Title is required';
  }

  if (Validator.isEmpty(data.description)) {
    errors.descriptionErr = 'Description is required';
  }

  if (!Validator.isMongoId(userId)) {
    errors.issuerErr = 'Issuer is invalid';
  }

  if (Validator.isEmpty(data.deadline)) {
    errors.deadlineErr = 'Deadline is required';
  }

  if (!Validator.isDate(new Date(data.deadline))) {
    errors.deadlineErr = 'Deadline is invalid';
  }

  if (!Array.isArray(data.assignedTo)) {
    errors.membersErr = 'Members data is invalid';
  } else {
    for (let member of data.assignedTo) {
      if (!Validator.isEmail(member.email)) {
        errors.membersErr = 'Members email is required';
        break;
      }
    }
  }

  if (Validator.isEmpty(data.priority)) {
    errors.priorityErr = 'Priority is required';
  }

  if (!Validator.isIn(data.priority, ['Low', 'Medium', 'High'])) {
    errors.priorityErr = 'Priority is invalid';
  }

  if (Validator.isEmpty(data.status)) {
    errors.statusErr = 'Status is required';
  }

  if (!Validator.isIn(data.status, ['New', 'In Progress', 'Completed'])) {
    errors.statusErr = 'Status is invalid';
  }

  if (Validator.isEmpty(data.type)) {
    errors.typeErr = 'Type is required';
  }

  if (!Validator.isIn(data.type, ['New Feature', 'Issue'])) {
    errors.typeErr = 'Type is invalid';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
