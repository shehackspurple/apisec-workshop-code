//Bad code
const express = require('express');
const app = express();

app.use(express.json());   // Needed for parsing JSON request bodies

const users = [		// Simulated user data with plain text passwords (insecure)
  { id: 1, username: 'admin', password: 'password123' },
  { id: 2, username: 'user', password: '123password' }
];

app.post('/login', (req, res) => {	// Login endpoint with broken user authentication
  const { username, password } = req.body;

  // Check the user's credentials in an insecure manner (plain text comparison)
  const user = users.find(user => user.username === username && user.password === password);

  // Respond based on the success or failure of the authentication
  if (user) {
    return res.json({ message: 'Login successful' });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000')); // Start the server
