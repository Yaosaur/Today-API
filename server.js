const express = require('express');
const app = express();
const cors = require('cors');
const ExpressError = require('./utils/ExpressError');
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

const validateLoginInput = require('./utils/validation/login');
const validateRegisterInput = require('./utils/validation/register');

mongoose.connect(process.env.MONGO_URI);
mongoose.connection.once('open', () => {
  console.log('connected to mongo');
});

app.use(passport.initialize());
require('./utils/passport');

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

app.post('/register', (req, res, next) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  const { firstNameErr, lastNameErr, emailErr, passwordErr } = errors;

  if (!isValid) {
    if (firstNameErr) {
      throw new ExpressError(firstNameErr, 400);
    } else if (lastNameErr) {
      throw new ExpressError(lastNameErr, 400);
    } else if (emailErr) {
      throw new ExpressError(emailErr, 400);
    } else if (passwordErr) {
      throw new ExpressError(passwordErr, 400);
    }
  }

  const { password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 12);
  User.create({ ...req.body, password: hashedPassword }, (err, newUser) => {
    if (err) {
      if (err.code === 11000) {
        return next(
          new ExpressError('An account with that email already exists.', 409)
        );
      } else {
        return next(new ExpressError());
      }
    }
    const { email, firstName, lastName, image } = newUser;
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

app.post('/login', (req, res, next) => {
  const { errors, isValid } = validateLoginInput(req.body);
  const { emailErr, passwordErr } = errors;

  if (!isValid) {
    if (emailErr) {
      throw new ExpressError(emailErr, 400);
    } else if (passwordErr) {
      throw new ExpressError(passwordErr, 400);
    }
  }

  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return next(new ExpressError('Invalid Credentials'));
    } else {
      if (!bcrypt.compareSync(req.body.password, user.password)) {
        return next(new ExpressError('Invalid Credentials'));
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

app.use((req, res, next) => {
  throw new ExpressError('Could not find this route.', 404);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.statusCode || 500)
    .json(error.message || 'Something went wrong!');
});

const server = app.listen(port, () => {
  console.log('I am listening on port', port);
});

const io = socket(server, {
  cors: {
    origin: [
      `http://${process.env.CLIENT_ORIGIN}`,
      `https://${process.env.CLIENT_ORIGIN}`,
    ],
    credentials: true,
  },
});

const sids = io.of('/').adapter.sids;

io.on('connection', socket => {
  socket.on('joinRoom', roomId => {
    socket.join(roomId.split('&').sort().join('&'));
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
    const senderRoom = Array.from(sids.get(socket.id))[1];
    io.to(senderRoom).emit('receiveMsg', newMessage);
  });

  socket.on('disconnect', () => {});
});
