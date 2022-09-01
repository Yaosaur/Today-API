const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
