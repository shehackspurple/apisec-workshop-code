// Better CODE — secure against mass assignment (but no extra layers of defense)

//setup
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

// Secure route that prevents mass assignment
app.post('/users', (req, res) => {
  // Create allowlist of fields that clients are allowed to set
  // This prevents attackers from setting sensitive fields like 'isAdmin'
  const allowedFields = ['username', 'email'];
  
  // Only extract allowed fields from request body
  // Instead of passing the entire req.body, we only pass allowed fields
  const userData = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      userData[field] = req.body[field];
    }
  });
  
  // If someone (an attacker) adds { isAdmin: true } it will be ignored
  const newUser = new User(userData);

  // Save the new user document to the database
  newUser.save().then(() => {
    res.json(newUser);
  }).catch((err) => {
    res.status(400).json({ error: err.message });
  });
});
