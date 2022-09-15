const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  poster: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  published: { type: Date },
  comment: { type: String, required: true },
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
