const router = require('express').Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');
const { calculatePriorityScore } = require('../utils/priorityEngine');

router.get('/', auth, async (req, res) => {
  try {
    const managerId = req.user.id;

    // Sirf us manager ke assign kiye tasks
    const myTasks = await Task.find({ createdBy: managerId })
      .populate('assignedTo', 'name');

    // Sirf un members ka data jo is manager ne assign kiye hain
    const assignedUserIds = [...new Set(
      myTasks
        .filter(t => t.assignedTo)
        .map(t => t.assignedTo._id.toString())
    )];

    const members = await User.find({
      _id: { $in: assignedUserIds },
      role: 'team_member'
    }, 'name email');

    const workload = members.map(u => {
      const userTasks = myTasks.filter(
        t => t.assignedTo?._id?.toString() === u._id.toString()
      );
      const pending = userTasks.filter(t => t.status !== 'done').length;
      const done = userTasks.filter(t => t.status === 'done').length;
      const avgScore = pending > 0
        ? Math.round(
            userTasks
              .filter(t => t.status !== 'done')
              .reduce((s, t) => s + calculatePriorityScore(t), 0) / pending * 10
          ) / 10
        : 0;
      return { user: u, pending, done, avgScore };
    });

    const overdue = myTasks.filter(
      t => t.deadline < new Date() && t.status !== 'done'
    ).length;

    const critical = myTasks.filter(
      t => calculatePriorityScore(t) >= 8 && t.status !== 'done'
    ).length;

    res.json({
      workload,
      summary: {
        total: myTasks.length,
        overdue,
        critical
      },
      tasks: myTasks
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;