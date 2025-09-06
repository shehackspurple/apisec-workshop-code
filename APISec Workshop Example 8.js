// Bette code, fixes Unrestricted Resource Consumption only
const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();

// Rate limiter middleware limits number of requests from one IP address
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply the rate limiter to all requests to the '/data' endpoint
// Fix for Unrestricted Resource Consumption vulnerability
app.get('/data', limiter, (req, res) => {
  // Process and return data only if rate limit is not reached
  res.json({ message: 'Data retrieved successfully' });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
