// Better CODE
// Fix for only Broken Function Level Authorization vulnerability
const express = require('express');
const app = express();

// Simulated user roles for demonstration purposes only, you would not do this normally
const userRoles = {
  admin: 'admin',
  user: 'user'
};

// SIMULATION: Pretend middleware to set req.user (in real apps, this comes from JWT/session)
// This simulates what happens after proper authentication
app.use((req, res, next) => {
  // In a real app, this would be populated by your auth middleware after validating JWT/session
  // For demo purposes, we'll create different users based on a header
  const userId = req.headers['user-id'];
  if (userId === '1') {
    req.user = { id: 1, role: 'admin' };
  } else if (userId === '2') {
    req.user = { id: 2, role: 'user' };
  }
  // If no user-id header, req.user remains undefined (unauthenticated)
  next();
});

// THE FIX: Proper authorization middleware
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }
  next();
}

function requireRole(requiredRole) {
  return (req, res, next) => {
    // THE FIX: Check server-controlled req.user.role, NOT the client input
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    next();
  };
}

// secure route: Authorization is enforced server-side
app.get('/admin/data', requireAuth, requireRole(userRoles.admin), (req, res) => {
  // user is authenticated & has admin role
  // middleware verified it server-side already
  res.json({ 
    message: 'Admin data retrieved successfully',
    user: req.user.id 
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
  // tests!
  console.log('Test with: curl -H "user-id: 1" http://localhost:3000/admin/data (admin access accepted)');
  console.log('Test with: curl -H "user-id: 2" http://localhost:3000/admin/data (admin access declined)');
  console.log('Test with: curl http://localhost:3000/admin/data (unauthenticated, access declined)');
});


