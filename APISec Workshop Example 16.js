// Better CODE
// Fixed API Consumption with Input Validation
const axios = require('axios');

// Pretend an auth middleware ran earlier and set req.user = { id: number }.
// In a real app you would use a real authentication layer.
function requireAuth(req, res, next) {
  if (!req.user || typeof req.user.id !== 'number') {
    return res.status(401).json({ message: 'Unauthenticated' });
  }
  next();
}

// Preconfigured HTTP client for the trusted API calls (allowlisted)
const ordersApi = axios.create({
  baseURL: 'https://orders.example.com',        // only talk to this upstream (HTTP client object)
  timeout: 3000,                                 // avoid very long connections
  headers: { Authorization: `Bearer ${process.env.ORDERS_API_TOKEN}` }, // server-held cred
  validateStatus: (s) => s >= 200 && s < 300,    // treat non-2xx HTTP codes as errors
});

// Secure API consumption: userId comes from server-derived identity, not from client input
app.get('/orders', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id; // changed from insecure req.query.userId

    // Call the external API with allowed/approved parameters
    const resp = await ordersApi.get('/orders', { params: { userId } });

    // Basic response validation: expect an array of orders
    if (!Array.isArray(resp.data)) {
      return res.status(502).json({ message: 'Invalid upstream response' });
    }

    // rebuild each object to include only the fields you allow, before sending back to client (no leaks!)
    const safe = resp.data.map(({ id, total, status }) => ({ id, total, status }));

    return res.json(safe);
  } catch (err) {
    // Clear error messages about why this API call went bad, without leaking sensitive info
    if (err.response) {
      return res.status(502).json({ message: 'Upstream error', status: err.response.status });
    }
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ message: 'Upstream timeout' });
    }
    return res.status(502).json({ message: 'Upstream unavailable' });
  }
});
