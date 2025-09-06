// Better CODE 
// Fixes SSRF (Server-Side Request Forgery) only
const express = require('express');
const axios = require('axios');
const dns = require('dns').promises;
const net = require('net');

const app = express();


// Allowlist the external hosts your server is permitted to contact
const ALLOWED_HOSTS = new Set([
  'allowed-site.com',
  // 'shehackspurple.ca',
]);


// Basic private IPv4 detection (blocks RFC1918, loopback, link-local, multicast/reserved).
// Resolve IPv4, reject IPv6  
function isPrivateIPv4(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(n => Number.isNaN(n))) return true; // treat invalid as unsafe
  const [a, b] = parts;
  if (a === 10) return true;                          // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true;   // 172.16.0.0/12
  if (a === 192 && b === 168) return true;            // 192.168.0.0/16
  if (a === 127) return true;                         // 127.0.0.0/8 (loopback)
  if (a === 169 && b === 254) return true;            // 169.254.0.0/16 (link-local)
  if (a >= 224) return true;                          // multicast/reserved
  return false;
}

// Secure route that prevents SSRF by validating and constraining the outbound URL
app.get('/secure/fetch-data', async (req, res) => {
  const { dataUrl } = req.query;

  try {
    // Step 1) Parsing & basic checks
    if (typeof dataUrl !== 'string' || !dataUrl) {
      return res.status(400).json({ message: 'Invalid dataUrl' });
    }

    const parsed = new URL(dataUrl);

    // Only HTTPS (no http, file:, gopher:, etc.)
    if (parsed.protocol !== 'https:') {
      return res.status(400).json({ message: 'Only HTTPS is allowed' });
    }

    // No credentials in URL
    if (parsed.username || parsed.password) {
      return res.status(400).json({ message: 'Credentials in URL are not allowed' });
    }

    // Reject literal IPs (attackers often try http(s)://127.0.0.1 or http(s)://169.254.169.254)
    if (net.isIP(parsed.hostname)) {
      return res.status(400).json({ message: 'IP addresses are not allowed' });
    }

    // Enforce our hostname allowlist
    if (!ALLOWED_HOSTS.has(parsed.hostname)) {
      return res.status(403).json({ message: 'Host not allowed' });
    }

    // Optional: only standard HTTPS port
    if (parsed.port && parsed.port !== '' && parsed.port !== '443') {
      return res.status(400).json({ message: 'Only port 443 is allowed' });
    }

    // 2) DNS resolution check (defense against SSRF & DNS rebinding to private IPs)
    //    Resolve A records (IPv4) and ensure they are all public.
    const addresses = await dns.resolve4(parsed.hostname);
    if (!addresses.length || addresses.some(isPrivateIPv4)) {
      return res.status(403).json({ message: 'Resolved to a private/invalid address' });
    }

    // 3) Fetch with safe client settings:
    //    - No redirects (prevent validating a good host but it redirects to internal)
    //    - Small timeout/content limit to avoid resource abuse side-effects
    const response = await axios.get(parsed.toString(), {
      timeout: 3000,                 // small, reasonable network timeout
      maxRedirects: 0,               // do not follow redirects
      maxContentLength: 1 * 1024 * 1024, // 1 MB cap
      responseType: 'json',
      validateStatus: (s) => s >= 200 && s < 300, // treat redirects/errors as failures
    });

    return res.json({
      message: 'Secure data fetched successfully',
      data: response.data,
    });
  } catch (err) {
    // If we blocked a redirect, Axios throws with a 3xx; surface a clean error
    if (err.response && err.response.status >= 300 && err.response.status < 400) {
      return res.status(400).json({ message: 'Redirects are not allowed' });
    }
    return res.status(500).json({ message: 'Failed to fetch secure data' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
