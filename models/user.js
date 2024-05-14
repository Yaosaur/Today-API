const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minLength: 6 },
  //S3 account no longer active - Legacy code is no longer being used in project
  //Images stored the URL to the object in S3 bucket
  //image: { type: String },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
});

const User = mongoose.model('User', userSchema);
module.exports = User;
