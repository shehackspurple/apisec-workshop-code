//Better code
const express = require('express');
const app = express();
const vault = require('vault-client'); // Assuming a fictional Vault API client

app.use(express.json()); // parse JSON bodies

// Simulated user data with usernames only, no secrets in code
const users = [
  { id: 1, username: 'admin' },
  { id: 2, username: 'user' }
];

// Login endpoint with improved user authentication using passwords from HashiCorp Vault
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fetch the user's password from HashiCorp Vault based on the username
    const user = users.find(user => user.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Using the Vault API method to fetch secret data
    const userPassword = await vault.getSecret(`secret/user/${user.id}/password`);
    
    // Compare the password from Vault with the provided password
    if (userPassword === password) {
      return res.json({ message: 'Login successful' });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error fetching user password from HashiCorp Vault', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
