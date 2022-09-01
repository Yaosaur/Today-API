const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

const mongoose = require('mongoose');
const User = require('./models/user');

mongoose.connect(process.env.MONGO_URI);
mongoose.connection.once('open', () => {
  console.log('connected to mongo');
});

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post('/register', (req, res) => {
  User.create(req.body, () => {
    res.send('created!');
  });
});

app.listen(port, () => {
  console.log('I am listening on port', port);
});
