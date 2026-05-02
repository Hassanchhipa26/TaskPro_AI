const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  deadline: { type: Date, required: true },
  effort: { type: Number, min: 1, max: 10, required: true },
  impact: { type: Number, min: 1, max: 10, required: true },
  priorityScore: { type: Number, default: 0 },
  status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedAt: Date
}, { timestamps: true });

// Indexing for faster queries
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ priorityScore: -1 });
taskSchema.index({ deadline: 1 });

module.exports = mongoose.model('Task', taskSchema);