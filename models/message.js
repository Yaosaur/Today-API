const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const Message = mongoose.model('message', messageSchema);
module.exports = Message;
