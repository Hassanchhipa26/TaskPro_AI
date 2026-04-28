import React, { useState } from 'react';

const priorityColors = {
  Critical: { bg: '#450a0a', border: '#ef4444', text: '#fca5a5' },
  High:     { bg: '#431407', border: '#f97316', text: '#fdba74' },
  Medium:   { bg: '#1c1917', border: '#eab308', text: '#fde047' },
  Low:      { bg: '#052e16', border: '#22c55e', text: '#86efac' },
};

const statusColors = {
  todo:        { bg: '#1e1e2e', text: '#9ca3af' },
  in_progress: { bg: '#1e3a5f', text: '#60a5fa' },
  done:        { bg: '#052e16', text: '#86efac' },
};

const s = {
  card: { borderRadius: 12, padding: 20, border: '1px solid #374151', background: '#1e1e2e', display: 'flex', flexDirection: 'column', gap: 10, transition: 'transform 0.15s', cursor: 'default' },
  title: { color: '#e2e8f0', fontSize: 16, fontWeight: 600 },
  desc: { color: '#9ca3af', fontSize: 13, lineHeight: 1.5 },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid' },
  row: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  score: { color: '#c4b5fd', fontSize: 13, fontWeight: 700 },
  deadline: { color: '#6b7280', fontSize: 12 },
  meta: { color: '#6b7280', fontSize: 12 },
  select: { background: '#111827', border: '1px solid #374151', borderRadius: 6, color: '#e2e8f0', padding: '4px 8px', fontSize: 13, cursor: 'pointer', outline: 'none' },
  delBtn: { background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 18, marginLeft: 'auto', padding: '0 4px' },
  formula: { fontSize: 11, color: '#6b7280', fontStyle: 'italic' },
};

export default function TaskCard({ task, onStatusChange, onDelete }) {
  const [hovering, setHovering] = useState(false);
  const label = task.scoreLabel || 'Low';
  const pc = priorityColors[label];
  const sc = statusColors[task.status] || statusColors.todo;

  const daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const deadlineStr = daysLeft < 0
    ? `⚠️ Overdue by ${Math.abs(daysLeft)}d`
    : daysLeft === 0
    ? '🔴 Due today'
    : `📅 ${daysLeft}d left`;

  return (
    <div style={{ ...s.card, border: `1px solid ${pc.border}40`, transform: hovering ? 'translateY(-2px)' : 'none' }}
      onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={s.title}>{task.title}</div>
        <button style={s.delBtn} onClick={() => onDelete(task._id)} title="Delete">×</button>
      </div>

      {task.description && <div style={s.desc}>{task.description}</div>}

      <div style={s.row}>
        <span style={{ ...s.badge, background: pc.bg, color: pc.text, borderColor: pc.border }}>
          {label}
        </span>
        <span style={{ ...s.score }}>Score: {task.priorityScore}</span>
        <span style={{ ...s.badge, background: sc.bg, color: sc.text, borderColor: 'transparent', fontSize: 11 }}>
          {task.status.replace('_', ' ')}
        </span>
      </div>

      {/* <div style={s.formula}>
        Impact({task.impact})×0.4 + Urgency×0.4 + EasyFactor({11 - task.effort})×0.2
      </div> */}

      <div style={s.row}>
        <span style={{ ...s.deadline, color: daysLeft < 0 ? '#f87171' : daysLeft <= 2 ? '#fbbf24' : '#6b7280' }}>
          {deadlineStr}
        </span>
      </div>

      <div style={s.row}>
        <span style={s.meta}>Effort: {task.effort}/10</span>
        <span style={s.meta}>Impact: {task.impact}/10</span>
      </div>

      <select style={s.select} value={task.status}
        onChange={e => onStatusChange(task._id, e.target.value)}>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done ✓</option>
      </select>
    </div>
  );
}