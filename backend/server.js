const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
require('dotenv').config();

const app = express();

console.log('Server starting...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(compression());
app.use(morgan('dev'));

// CORS
app.use(cors({
  origin: ['https://task-pro-ai.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.set('trust proxy', 1);
app.use(express.json({ limit: '10kb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again later' }
});
app.use('/api/auth/', authLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/team', require('./routes/team'));

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

// Deadline reminder — roz subah 9 baje
cron.schedule('0 9 * * *', async () => {
  const { sendDeadlineReminderEmail } = require('./utils/emailService');
  const Task = require('./models/Task');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const start = new Date(tomorrow.setHours(0, 0, 0, 0));
  const end = new Date(tomorrow.setHours(23, 59, 59, 999));

  const tasks = await Task.find({
    deadline: { $gte: start, $lte: end },
    status: { $ne: 'done' }
  }).populate('assignedTo', 'name email');

  for (const task of tasks) {
    if (task.assignedTo?.email) {
      await sendDeadlineReminderEmail(
        task.assignedTo.email,
        task.assignedTo.name,
        task.title,
        task.deadline
      );
    }
  }
  console.log(`Deadline reminders sent for ${tasks.length} tasks`);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});