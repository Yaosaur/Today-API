const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dateCreated: { type: Date },
  deadline: { type: Date },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['In Progress', 'Completed'] },
  type: { type: String, enum: ['New Feature', 'Bug Fix'] },
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
