//Bad CODE
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true });

// Create a Mongoose model for User with defined schema
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  email: String,
  isAdmin: Boolean
}));

const app = express();

app.use(bodyParser.json());

// Vulnerable route that allows mass assignment of properties
app.post('/users', (req, res) => {
  // Insecurely assign all properties from the request body to a new user document
  const newUser = new User(req.body);

  // Save the new user document to the database
  newUser.save().then(() => {
    res.json(newUser);
  }).catch((err) => {
    res.status(400).json({ error: err.message });
  });
});
