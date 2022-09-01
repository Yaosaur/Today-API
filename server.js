const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const port = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI);
mongoose.connection.once('open', () => {
  console.log('connected to mongo');
});

app.get('/login');

app.listen(port, () => {
  console.log('I am listening on port', port);
});
