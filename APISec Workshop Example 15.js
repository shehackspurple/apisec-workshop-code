// Bad CODE
// Unsafe API Consumption
app.get('/orders', (req, res) => {
  let userId = req.query.userId;
  // Insecure API consumption - directly using user input without validation
  let orders = fetchOrdersFromExternalAPI(userId); // Potential security risk due to lack of input validation
  res.json(orders);
});


// Function to Fetch Orders from External API
function fetchOrdersFromExternalAPI(userId) {
  // Logic to fetch orders from an external API
  // Secure version would include authentication and error handling
  // Return orders related to the userId
}
