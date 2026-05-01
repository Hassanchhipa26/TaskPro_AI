const router = require('express').Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Alert = require('../models/Alert');
const { calculatePriorityScore, getScoreLabel } = require('../utils/priorityEngine');
const { sendTaskAssignEmail } = require('../utils/emailService');

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, deadline, effort, impact, assignedTo } = req.body;
    const taskData = { title, description, deadline, effort, impact, assignedTo, createdBy: req.user.id };
    const score = calculatePriorityScore(taskData);
    const task = await Task.create({ ...taskData, priorityScore: score });
    // Send email notification to the assigned member
    const member = await User.findById(assignedTo, 'name email');
   const manager = await User.findById(req.user.id, 'name');
   if (member) {
   await sendTaskAssignEmail(member.email, member.name, title, deadline, manager.name);
  }

    // Alert if deadline within 2 days
    const daysLeft = (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24);
    if (daysLeft <= 2) {
      await Alert.create({ task: task._id, user: assignedTo, type: 'approaching', message: `Task "${title}" is due in ${Math.ceil(daysLeft)} day(s)!` });
    }

    res.json({ ...task.toObject(), scoreLabel: getScoreLabel(score) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get tasks for logged-in user (sorted by priority score desc)
router.get('/my', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id, status: { $ne: 'done' } })
      .sort({ priorityScore: -1 })
      .populate('createdBy', 'name role');

    // Recalculate live scores (dynamic)
    const updated = tasks.map(t => {
      const score = calculatePriorityScore(t);
      return { ...t.toObject(), priorityScore: score, scoreLabel: getScoreLabel(score) };
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all tasks (mentor/teacher)
router.get('/all', auth, async (req, res) => {
  try {
    if (!['faculty_mentor', 'subject_teacher'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const tasks = await Task.find()
      .sort({ priorityScore: -1 })
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update task status
router.put('/:id', auth, async (req, res) => {
  try {
    const update = req.body;
    if (update.status === 'done') update.completedAt = new Date();
    const task = await Task.findByIdAndUpdate(req.params.id, update, { returnDocument: 'after' });
    const score = calculatePriorityScore(task);
    res.json({ ...task.toObject(), priorityScore: score, scoreLabel: getScoreLabel(score) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.createdBy.toString() !== req.user.id &&
        task.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}); 

// Get alerts for user
router.get('/alerts', auth, async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user.id, read: false })
      .populate('task', 'title deadline')
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark alert read
router.put('/alerts/:id/read', auth, async (req, res) => {
  try {
    await Alert.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;