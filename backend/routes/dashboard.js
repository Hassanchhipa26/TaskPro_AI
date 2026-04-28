const router = require('express').Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');
const { calculatePriorityScore } = require('../utils/priorityEngine');

router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ role: 'team_member' }, 'name email');
    const allTasks = await Task.find().populate('assignedTo', 'name');

    const workload = users.map(u => {
      const userTasks = allTasks.filter(t => t.assignedTo?._id?.toString() === u._id.toString());
      const pending = userTasks.filter(t => t.status !== 'done').length;
      const done = userTasks.filter(t => t.status === 'done').length;
      const avgScore = pending > 0
        ? Math.round(userTasks.filter(t => t.status !== 'done').reduce((s, t) => s + calculatePriorityScore(t), 0) / pending * 10) / 10
        : 0;
      return { user: u, pending, done, avgScore };
    });

    const overdue = allTasks.filter(t => t.deadline < new Date() && t.status !== 'done').length;
    const critical = allTasks.filter(t => calculatePriorityScore(t) >= 8 && t.status !== 'done').length;

    res.json({ workload, summary: { total: allTasks.length, overdue, critical } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;