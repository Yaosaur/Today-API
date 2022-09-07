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
const Project = require('./models/project');

mongoose.connect(process.env.MONGO_URI);
mongoose.connection.once('open', () => {
  console.log('connected to mongo');
});

app.use(passport.initialize());
require('./middleware/passport');

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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

app.get(
  '/projects',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    Project.find(
      { $or: [{ creator: req.user.id }, { members: req.user.id }] },
      (err, foundProjects) => {
        res.json(foundProjects);
      }
    );
  }
);

app.get(
  '/projects/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    Project.findById(req.params.id, (err, foundProject) => {
      foundProject
        .populate('members', '-_id firstName lastName email')
        .then(data => {
          res.json(data);
        });
    });
  }
);

app.post(
  '/projects',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const arrayOfEmails = req.body.members.map(member => member.email);
    const membersId = await User.find({ email: { $in: arrayOfEmails } }, '_id');
    Project.create(
      { ...req.body, members: membersId, creator: req.user.id },
      (err, createdProject) => {
        res.json(createdProject);
      }
    );
  }
);

app.put(
  '/projects/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const arrayOfEmails = req.body.members.map(member => member.email);
    const membersId = await User.find({ email: { $in: arrayOfEmails } }, '_id');
    Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, members: membersId },
      { new: true },
      (err, editedProject) => {
        res.json({ ...editedProject, members: req.body.members });
      }
    );
  }
);

app.delete(
  '/projects/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Project.findByIdAndRemove(req.params.id, (err, removedProject) => {
      res.json(removedProject);
    });
  }
);

app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.find({}, '-_id -password -projects', (err, foundUsers) => {
      res.json(foundUsers);
    });
  }
);

app.listen(port, () => {
  console.log('I am listening on port', port);
});
