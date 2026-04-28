const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'TaskPro API running' });
});

// PORT FIX (IMPORTANT FOR DEPLOYMENT)
const PORT = process.env.PORT || 5000;

// MongoDB Connection + Server Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });


// Cron job: check overdue tasks every hour
cron.schedule('0 * * * *', async () => {
  try {
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

    console.log('Cron job executed');
  } catch (err) {
    console.error('Cron error:', err);
  }
});