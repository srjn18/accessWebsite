const express = require('express');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// VARIABLE TO STORE HASHED PASSWORD
// ============================================
let HASHED_ADMIN_PASSWORD = null;

// ============================================
// INITIALIZE HASHED PASSWORD ON SERVER START
// ============================================
async function initializeHashedPassword() {
  try {
    HASHED_ADMIN_PASSWORD = await bcryptjs.hash(
      process.env.ADMIN_PASSWORD,
      10
    );
    console.log('Password hashed successfully');
  } catch (error) {
    console.error('Error hashing password:', error);
    process.exit(1);
  }
}

// ============================================
// MIDDLEWARE: VERIFY JWT TOKEN
// ============================================
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

// ============================================
// API ENDPOINT 1: LOGIN
// ============================================
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if email matches
    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare passwords
    const isPasswordValid = await bcryptjs.compare(
      password,
      HASHED_ADMIN_PASSWORD
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { email: process.env.ADMIN_EMAIL },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Token valid for 24 hours
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============================================
// API ENDPOINT 2: VERIFY TOKEN
// ============================================
app.post('/api/verify-token', verifyToken, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
});

// ============================================
// API ENDPOINT 3: PROTECTED ROUTE EXAMPLE
// ============================================
app.get('/api/admin-dashboard', verifyToken, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Welcome to admin dashboard',
    data: {
      adminEmail: req.user.email,
      timestamp: new Date()
    }
  });
});

// ============================================
// START SERVER
// ============================================
// Root route - show helpful message / link to frontend
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!doctype html>
  <html>
    <head><meta charset="utf-8"><title>Backend API</title></head>
    <body style="font-family:system-ui,Segoe UI,Roboto,Arial;line-height:1.6;padding:24px">
      <h1>Backend API</h1>
      <p>This is the backend API. The frontend dev server runs separately at <a href="http://localhost:4321/">http://localhost:4321/</a>.</p>
      <p>Available endpoints:</p>
      <ul>
        <li><code>POST /api/login</code></li>
        <li><code>POST /api/verify-token</code></li>
        <li><code>GET /api/admin-dashboard</code> (protected)</li>
      </ul>
    </body>
  </html>`);
});

async function startServer() {
  await initializeHashedPassword();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();