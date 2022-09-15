const mongoose = require('mongoose');
const Task = require('./task');
const Comment = require('./comment');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
});

projectSchema.post('findOneAndRemove', async function (project) {
  if (project) {
    const relatedTasks = await Task.find({
      _id: {
        $in: project.tasks,
      },
    });
    await Comment.deleteMany({
      _id: {
        $in: relatedTasks.map(task => task.comments).flat(),
      },
    });
    await Task.deleteMany({
      _id: {
        $in: project.tasks,
      },
    });
  }
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
