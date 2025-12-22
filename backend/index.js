const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route - ADD THIS!
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the backend API' });
});
console.log('Root route registered');  // Add this line

// Your other routes can go here
// app.get('/api/something', (req, res) => { ... });

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});