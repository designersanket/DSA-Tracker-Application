
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();

app.use(cors({
  origin: ['https://dsa-sanket.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dsa_tracker', {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      const message = err.name === 'TokenExpiredError' ? 'Session expired' : 'Invalid Token';
      return res.status(403).json({ message });
    }
    req.user = user;
    next();
  });
};

// Routes
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const aiRoutes = require('./routes/ai');
const visualizeRoutes = require('./routes/visualize');

app.use('/api/auth', authRoutes);
app.use('/api/questions', authenticateToken, questionRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/visualize', authenticateToken, visualizeRoutes);

app.get('/api/health', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
