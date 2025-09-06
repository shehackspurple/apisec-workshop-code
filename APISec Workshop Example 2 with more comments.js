//Bad code
const express = require('express');
const app = express();

app.use(express.json());   // Needed for parsing JSON request bodies
// VULN: No input size limits or validation middleware (e.g., celebrate/express-validator) —
//       allows oversized bodies and malicious payloads.

const users = [		// Simulated user data with plain text passwords (insecure)
  { id: 1, username: 'admin', password: 'password123' },
  { id: 2, username: 'user', password: '123password' }
];
// VULN: Hardcoded credentials in source control.
// VULN: Plaintext passwords (no hashing/salting).
// VULN: Predictable usernames (“admin”, “user”) ease brute-force attacks.
// VULN: No password policy / complexity / rotation.
// VULN: Storing auth data in-process memory — lost on restart and not auditable.

app.post('/login', (req, res) => {	// Login endpoint with broken user authentication
  const { username, password } = req.body;
  // VULN: No server-side validation/sanitization of username/password fields.
  // VULN: No rate limiting / account lockout / captcha → brute-force friendly.
  // VULN: No IP/device/fingerprint checks or MFA.

  // Check the user's credentials in an insecure manner (plain text comparison)
  const user = users.find(user => user.username === username && user.password === password);
  // VULN: Direct plaintext comparison; no hashing and no constant-time comparison →
  //       susceptible to credential disclosure + potential timing attacks.

  // Respond based on the success or failure of the authentication
  if (user) {
    return res.json({ message: 'Login successful' });
    // VULN: Returns success without issuing a session/token (no auth state),
    //       enabling replay or confused-deputy scenarios if added later.
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
    // NOTE: Generic failure message avoids user enumeration, which is good,
    //       but overall endpoint is still vulnerable due to issues above.
  }
});

app.listen(3000, () => console.log('Server running on port 3000')); // Start the server
// VULN: No HTTPS/TLS enforcement or security headers (e.g., helmet) — credentials can be sniffed.
// VULN: No structured logging/audit trail for auth attempts.
// VULN: No CSRF protection if this were used from a browser context (tokens/samesite cookies).
