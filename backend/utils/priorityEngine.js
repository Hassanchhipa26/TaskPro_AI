/**
 * Multi-factor AI Priority Scoring Engine
 * Score = (impact * 0.4) + (urgency * 0.4) + (effort_inverse * 0.2)
 * Urgency is calculated from days remaining until deadline
 */
function calculatePriorityScore(task) {
  const now = new Date();
  const deadline = new Date(task.deadline);
  const daysLeft = Math.max((deadline - now) / (1000 * 60 * 60 * 24), 0);

  // Urgency: 10 if due today, scales down to 1 at 30+ days
  const urgency = Math.max(10 - daysLeft / 3, 1);

  // Effort inverse: low effort = higher priority (easier wins)
  const effortInverse = 11 - task.effort;

  // Weighted formula
  const score = (task.impact * 0.4) + (urgency * 0.4) + (effortInverse * 0.2);

  return Math.round(score * 10) / 10; // one decimal
}

function getScoreLabel(score) {
  if (score >= 8) return 'Critical';
  if (score >= 6) return 'High';
  if (score >= 4) return 'Medium';
  return 'Low';
}

module.exports = { calculatePriorityScore, getScoreLabel };