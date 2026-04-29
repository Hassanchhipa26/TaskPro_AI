const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();

// Security headers
app.use(helmet());

// Compress responses — server load kam hoga
app.use(compression());

// CORS
app.use(cors());
app.use(express.json({ limit: '10kb' })); // body size limit

// Rate Limiting — ek IP se zyada requests block
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 min per IP
  message: { message: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// Auth ke liye strict limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // sirf 10 login attempts per 15 min
  message: { message: 'Too many login attempts, please try again later' }
});
app.use('/api/auth/', authLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/', (req, res) => res.json({ message: 'TaskPrio API running' }));

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error('DB Error:', err));

// Cron: Check overdue tasks every hour
cron.schedule('0 * * * *', async () => {
  const Task = require('./models/Task');
  const Alert = require('./models/Alert');
  const now = new Date();
  const overdue = await Task.find({ 
    deadline: { $lt: now }, 
    status: { $ne: 'done' } 
  });
  for (const task of overdue) {
    const exists = await Alert.findOne({ 
      task: task._id, 
      type: 'overdue' 
    });
    if (!exists) {
      await Alert.create({ 
        task: task._id, 
        user: task.assignedTo, 
        type: 'overdue', 
        message: `Task "${task.title}" is overdue!` 
      });
    }
  }
});