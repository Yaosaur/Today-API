const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const secret = process.env.SECRET;

const mongoose = require('mongoose');
const User = require('./models/user');

mongoose.connect(process.env.MONGO_URI);
mongoose.connection.once('open', () => {
  console.log('connected to mongo');
});

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/protected', (req, res) => {
  res.send('This should be protected!');
});

app.post('/register', (req, res) => {
  const { password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 12);
  User.create({ ...req.body, password: hashedPassword }, (err, newUser) => {
    const { email, firstName, lastName } = newUser;
    const id = newUser._id.toString();
    const token = jwt.sign({ id, email, firstName, lastName }, secret, {
      expiresIn: '8h',
    });
    res.json({ id, firstName, lastName, token });
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
        res.json({ id, email, firstName, lastName, token });
      }
    }
  });
});

app.listen(port, () => {
  console.log('I am listening on port', port);
});
