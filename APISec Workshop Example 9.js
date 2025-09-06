// Bad CODE
const express = require('express');
const app = express();

// Simulated user roles for demonstration purposes
const userRoles = {
  admin: 'admin',
  user: 'user'
};

// Vulnerable route that lacks proper authorization check
app.get('/admin/data', (req, res) => {
  if (req.query.role === userRoles.admin) { // Broken authorization logic based on query parameter
    res.json({ message: 'Admin data retrieved successfully' });
  } else {
    res.status(403).json({ message: 'Unauthorized access' });
  }
});
