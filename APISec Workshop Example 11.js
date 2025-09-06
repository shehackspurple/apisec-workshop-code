//Bad CODE
const express = require('express');
const axios = require('axios');
const url = require('url');

const app = express();

// Vulnerable route susceptible to SSRF due to insecure URL validation
app.get('/fetch-data', async (req, res) => {
  const { dataUrl } = req.query;
  try {
    const response = await axios.get(dataUrl); 
// Vulnerable code, directly using user-provided input, no input validation!
    
res.json({ message: 'Data fetched successfully', data: response.data });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch data' });
  }
});
