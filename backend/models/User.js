const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['team_member', 'faculty_mentor', 'subject_teacher'], default: 'team_member' }
}, { timestamps: true });

userSchema.index({ email: 1 }); // For faster login queries
userSchema.index({ role: 1 }); // For faster role-based queries

module.exports = mongoose.model('User', userSchema);