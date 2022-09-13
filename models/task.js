const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  title: { type: String, required: true },
  description: { type: String },
  dateCreated: { type: Date },
  deadline: { type: Date },
  issuer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  priority: { type: String, enum: ['Low', 'Medium', 'High'] },
  status: { type: String, enum: ['New', 'In Progress', 'Completed'] },
  type: { type: String, enum: ['New Feature', 'Issue'] },
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
