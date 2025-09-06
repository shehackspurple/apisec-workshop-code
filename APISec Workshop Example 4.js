//Best code

// Production-grade login endpoint with secure password verification and basic hardening.

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const argon2 = require('argon2');               // npm i argon2
const vault = require('vault-client');          // fictional Vault client; replace with your SDK
const crypto = require('crypto');               // for any random needs (not for password hashing)

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));       // avoid oversized bodies
app.use(helmet());                              // security headers

// Brute-force protection on the login route
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});
// Caps each client to 10 login attempts per 15 minutes. 
// Slows credential-stuffing/brute-force.

// Example directory: no secrets should be stored here
const users = [
  { id: 1, username: 'admin' },
  { id: 2, username: 'user' }
];

// Optional server-side "pepper" (set this in your environment, not in code)
const PEPPER = process.env.PASSWORD_PEPPER || '';

// Validate basic shape of input 
// Ensures username/password exist and are strings and password meets a minimal length
function validateLoginBody(body) {
  if (!body || typeof body !== 'object') return false;
  const { username, password } = body;
  if (typeof username !== 'string' || typeof password !== 'string') return false;
  if (!username.trim() || password.length < 8) return false; // adjust policy as needed
  return true;
}

app.post('/login', loginLimiter, async (req, res) => {
  try {
    if (!validateLoginBody(req.body)) {
      return res.status(400).json({ message: 'Invalid request' });
    }
    //if body doesn't validate, stop

    const username = req.body.username.trim(); 
    const password = req.body.password;

    // Look up user record (replace this with your DB, this is just a demo)
    const user = users.find(u => u.username === username);
    // Use vague errors to avoid user enumeration
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Fetch the stored password hash from Vault 
    // For argon2, the hash string encodes salt & parameters internally.
    const secret = await vault.getSecret(`secret/user/${user.id}/passwordHash`);
    const storedHash = typeof secret === 'string' ? secret : (secret?.data || secret?.value);

    if (typeof storedHash !== 'string' || !storedHash) {
      console.error('Missing/invalid password hash for user', user.id);
      // we might not want to give so much information in this error message
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    // Verify using argon2 (constant-time under the hood).
    // Include a server-side pepper if you’ve configured one.
    const ok = await argon2.verify(storedHash, password + PEPPER);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    // SUCCESS — issue a session/JWT here; omitted for workshop simplicity.
    return res.json({ message: 'Login successful' });
  } catch (err) {
    console.error('Auth error', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
