//Bad CODE
const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();


// Vulnerable route that can be exploited for unrestricted resource consumption
app.get('/data', (req, res) => {
  // Process and return ALL data, no limits
  res.json({ message: 'Data retrieved successfully' });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

//note, we don't even use the ratelimit const