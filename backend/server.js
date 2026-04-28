const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/', (req, res) => res.json({ message: 'TaskPrio API running' }));

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error('DB Error:', err));

// Cron: Check overdue tasks every hour
cron.schedule('0 * * * *', async () => {
  const Task = require('./models/Task');
  const Alert = require('./models/Alert');
  const now = new Date();
  const overdue = await Task.find({ deadline: { $lt: now }, status: { $ne: 'done' } });
  for (const task of overdue) {
    const exists = await Alert.findOne({ task: task._id, type: 'overdue' });
    if (!exists) {
      await Alert.create({ task: task._id, user: task.assignedTo, type: 'overdue', message: `Task "${task.title}" is overdue!` });
    }
  }
});