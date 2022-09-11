const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('dotenv').config();
const port = process.env.PORT || 5000;
const secret = process.env.SECRET;

const mongoose = require('mongoose');
const User = require('./models/user');

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
app.use('/users', usersController);
app.use('/tasks/', tasksController);
app.use('/projects', projectsController);

app.post('/register', (req, res) => {
  const { password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 12);
  User.create({ ...req.body, password: hashedPassword }, (err, newUser) => {
    const { email, firstName, lastName } = newUser;
    const id = newUser._id.toString();
    const token = jwt.sign({ id, email, firstName, lastName }, secret, {
      expiresIn: '8h',
    });
    res.json({ id, firstName, lastName, email, token: 'Bearer ' + token });
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
        const { id, email, firstName, lastName } = user;
        const token = jwt.sign({ id, email, firstName, lastName }, secret, {
          expiresIn: '8h',
        });
        res.json({ id, firstName, lastName, email, token: 'Bearer ' + token });
      }
    }
  });
});

app.listen(port, () => {
  console.log('I am listening on port', port);
});
