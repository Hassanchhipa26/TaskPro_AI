const router = require('express').Router();
const auth = require('../middleware/auth');
const Team = require('../models/Team');
const User = require('../models/User');
const { sendTeamAddEmail } = require('../utils/emailService');

// Get my team
router.get('/', auth, async (req, res) => {
  try {
    let team = await Team.findOne({ manager: req.user.id })
      .populate('members', 'name email role');
    if (!team) return res.json({ members: [] });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search member by email
router.get('/search', auth, async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      role: 'team_member'
    }, 'name email role');
    if (!user) return res.status(404).json({ message: 'Team member not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add member to my team
router.post('/add', auth, async (req, res) => {
  try {
    const { memberId } = req.body;
    const member = await User.findById(memberId);
    if (!member || member.role !== 'team_member') {
      return res.status(404).json({ message: 'Team member not found' });
    }
    let team = await Team.findOne({ manager: req.user.id });
    if (!team) {
      team = await Team.create({ manager: req.user.id, members: [] });
    }
    if (team.members.includes(memberId)) {
      return res.status(400).json({ message: 'Member already in your team' });
    }
    team.members.push(memberId);
    await team.save();

    // Email bhejo
    const manager = await User.findById(req.user.id, 'name');
    await sendTeamAddEmail(member.email, member.name, manager.name);

    const updated = await Team.findOne({ manager: req.user.id })
      .populate('members', 'name email role');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove member from team
router.delete('/remove/:memberId', auth, async (req, res) => {
  try {
    const team = await Team.findOne({ manager: req.user.id });
    if (!team) return res.status(404).json({ message: 'Team not found' });
    team.members = team.members.filter(
      m => m.toString() !== req.params.memberId
    );
    await team.save();
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;