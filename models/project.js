const mongoose = require('mongoose');
const Task = require('./task');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
});

projectSchema.post('findOneAndRemove', async function (project) {
  if (project) {
    await Task.deleteMany({
      _id: {
        $in: project.tasks,
      },
    });
  }
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
