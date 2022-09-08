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
const Task = require('./models/task');

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
    const foundProjects = await Project.find({
      $or: [{ creator: req.user.id }, { members: req.user.id }],
    })
      .populate('creator members', '-_id firstName lastName email')
      .populate({
        path: 'tasks',
        populate: [
          { path: 'issuer', select: '-_id firstName lastName email' },
          { path: 'assignedTo', select: '-_id firstName lastName email' },
        ],
      });
    res.json(foundProjects);
  }
);

app.get(
  '/projects/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const foundProjects = await Project.findById(req.params.id)
      .populate('creator members', '-_id firstName lastName email')
      .populate({
        path: 'tasks',
        populate: [
          { path: 'issuer', select: '-_id firstName lastName email' },
          { path: 'assignedTo', select: '-_id firstName lastName email' },
        ],
      });
    res.json(foundProjects);
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
    const editedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, members: membersId },
      { new: true }
    )
      .populate('creator members', '-_id firstName lastName email')
      .populate({
        path: 'tasks',
        populate: [
          { path: 'issuer', select: '-_id firstName lastName email' },
          { path: 'assignedTo', select: '-_id firstName lastName email' },
        ],
      });
    res.json(editedProject);
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

app.post(
  '/projects/:id/task',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const arrayOfEmails = req.body.assignedTo.map(member => member.email);
    const membersId = await User.find({ email: { $in: arrayOfEmails } }, '_id');
    const newTask = await Task.create({
      ...req.body,
      dateCreated: new Date(),
      issuer: req.user.id,
      assignedTo: membersId,
      status: 'In Progress',
    });
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $push: { tasks: newTask._id } },
      { new: true }
    )
      .populate('creator members', '-_id firstName lastName email')
      .populate({
        path: 'tasks',
        populate: [
          { path: 'issuer', select: '-_id firstName lastName email' },
          { path: 'assignedTo', select: '-_id firstName lastName email' },
        ],
      });
    res.json(updatedProject);
  }
);

app.listen(port, () => {
  console.log('I am listening on port', port);
});
