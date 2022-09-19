const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const socket = require('socket.io');
require('dotenv').config();
const port = process.env.PORT || 5000;
const secret = process.env.SECRET;

const mongoose = require('mongoose');
const User = require('./models/user');
const Message = require('./models/message');

mongoose.connect(process.env.MONGO_URI);
mongoose.connection.once('open', () => {
  console.log('connected to mongo');
});

app.use(passport.initialize());
require('./middleware/passport');

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const usersController = require('./controllers/users.js');
const projectsController = require('./controllers/projects.js');
const tasksController = require('./controllers/tasks.js');
const commentsController = require('./controllers/comments.js');
const messagesController = require('./controllers/messages.js');
app.use('/users', usersController);
app.use('/tasks', tasksController);
app.use('/comments', commentsController);
app.use('/projects', projectsController);
app.use('/messages', messagesController);

app.post('/register', (req, res) => {
  const { password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 12);
  User.create({ ...req.body, password: hashedPassword }, (err, newUser) => {
    const { email, firstName, lastName } = newUser;
    const id = newUser._id.toString();
    const token = jwt.sign({ id, email, firstName, lastName }, secret, {
      expiresIn: '8h',
    });
    res.json({
      id,
      firstName,
      lastName,
      email,
      image,
      token: 'Bearer ' + token,
    });
  });
});

app.post('/login', (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      res.json({ error: 'Invalid Credentials' });
    } else {
      if (!bcrypt.compareSync(req.body.password, user.password)) {
        res.json({ error: 'Invalid Credentials' });
      } else {
        const { id, email, firstName, lastName, image } = user;
        const token = jwt.sign({ id, email, firstName, lastName }, secret, {
          expiresIn: '8h',
        });
        res.json({
          id,
          firstName,
          lastName,
          email,
          image,
          token: 'Bearer ' + token,
        });
      }
    }
  });
});

const server = app.listen(port, () => {
  console.log('I am listening on port', port);
});

const io = socket(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on('connection', socket => {
  global.chatSocket = socket;

  socket.on('addUser', userId => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on('sendMsg', async data => {
    const { receiverEmail, sender, content } = data;
    const receivingUserId = await User.findOne(
      {
        email: receiverEmail,
      },
      'id'
    );
    const newMessage = await Message.create({
      sender,
      users: [sender, receivingUserId],
      content,
    });
    await newMessage.populate(
      'sender users',
      '-_id firstName lastName email image'
    );
    const senderSocket = onlineUsers.get(sender);
    const receivingUserSocket = onlineUsers.get(receivingUserId._id.toString());
    io.to(senderSocket).to(receivingUserSocket).emit('receiveMsg', newMessage);
  });
});
