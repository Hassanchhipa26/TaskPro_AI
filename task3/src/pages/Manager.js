import React, { useState, useEffect, useContext } from 'react';
// import axios from 'axios
import API from '../api'; 
import { AuthContext } from '../App';

const s = {
  page: { minHeight: '100vh', background: '#0f0f1a', padding: '24px 32px' },
  title: { color: '#e2e8f0', fontSize: 22, fontWeight: 700, marginBottom: 24 },
  summaryRow: { display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' },
  statCard: { background: '#1e1e2e', borderRadius: 12, padding: '20px 28px', flex: 1, minWidth: 160, border: '1px solid #374151' },
  statNum: { fontSize: 36, fontWeight: 700 },
  statLabel: { color: '#9ca3af', fontSize: 13, marginTop: 4 },
  section: { color: '#a78bfa', fontSize: 16, fontWeight: 700, marginBottom: 14 },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: 32 },
  th: { color: '#6b7280', fontSize: 12, fontWeight: 600, textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #374151' },
  td: { color: '#e2e8f0', fontSize: 14, padding: '12px', borderBottom: '1px solid #1f2937' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  modal: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modalBox: { background: '#1e1e2e', borderRadius: 16, padding: 32, width: 440 },
  inp: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #374151', background: '#111827', color: '#e2e8f0', fontSize: 14, marginBottom: 12, outline: 'none' },
  label: { color: '#9ca3af', fontSize: 12, marginBottom: 4, display: 'block' },
  btn: { background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  exportBtn: { background: '#065f46', color: '#6ee7b7', border: '1px solid #047857', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
};

export default function Manager() {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState({ workload: [], summary: {} });
  const [allTasks, setAllTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', deadline: '', effort: 5, impact: 5, assignedTo: '' });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchDashboard = async () => {
    const { data: d } = await API.get('/api/dashboard', { headers });
    setData(d);
    if (d.workload) setUsers(d.workload.map(w => w.user));
  };

  const fetchAllTasks = async () => {
    const { data: t } = await API.get('/api/tasks/all', { headers });
    setAllTasks(t);
  };

  // eslint-disable-next-line
useEffect(() => { fetchDashboard(); fetchAllTasks(); }, []);

  const assignTask = async () => {
    if (!form.title || !form.deadline || !form.assignedTo) return;
    await API.post('/api/tasks', form, { headers });
    setShowModal(false);
    setForm({ title: '', description: '', deadline: '', effort: 5, impact: 5, assignedTo: '' });
    fetchDashboard(); fetchAllTasks();
  };

  const exportCSV = () => {
    const rows = [['Title', 'Assigned To', 'Status', 'Priority Score', 'Deadline', 'Effort', 'Impact']];
    allTasks.forEach(t => rows.push([
      t.title,
      t.assignedTo?.name || 'Unassigned',
      t.status,
      t.priorityScore,
      new Date(t.deadline).toLocaleDateString(),
      t.effort,
      t.impact
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'taskprio_report.csv';
    a.click();
  };

  const scoreColor = (score) => {
    if (score >= 8) return '#f87171';
    if (score >= 6) return '#fb923c';
    if (score >= 4) return '#fbbf24';
    return '#34d399';
  };

  return (
    <div style={s.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={s.title}>Manager Dashboard</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={s.exportBtn} onClick={exportCSV}>Export CSV</button>
          <button style={s.btn} onClick={() => setShowModal(true)}>+ Assign Task</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={s.summaryRow} className="summary-row">
        <div style={{ ...s.statCard, borderColor: '#7c3aed40' }}>
          <div style={{ ...s.statNum, color: '#a78bfa' }}>{data.summary?.total || 0}</div>
          <div style={s.statLabel}>Total Tasks</div>
        </div>
        <div style={{ ...s.statCard, borderColor: '#ef444440' }}>
          <div style={{ ...s.statNum, color: '#f87171' }}>{data.summary?.overdue || 0}</div>
          <div style={s.statLabel}>Overdue</div>
        </div>
        <div style={{ ...s.statCard, borderColor: '#f9731640' }}>
          <div style={{ ...s.statNum, color: '#fb923c' }}>{data.summary?.critical || 0}</div>
          <div style={s.statLabel}>Critical Priority</div>
        </div>
        <div style={{ ...s.statCard, borderColor: '#22c55e40' }}>
          <div style={{ ...s.statNum, color: '#34d399' }}>{data.workload?.length || 0}</div>
          <div style={s.statLabel}>Team Members</div>
        </div>
      </div>

      {/* Workload Table */}
      <div style={s.section}>Team Workload Distribution</div>
      <table style={s.table} className="dashboard-table" >
        <thead>
          <tr>
            <th style={s.th}>Member</th>
            <th style={s.th}>Pending Tasks</th>
            <th style={s.th}>Completed</th>
            <th style={s.th}>Avg Priority Score</th>
            <th style={s.th}>Workload</th>
          </tr>
        </thead>
        <tbody>
          {data.workload?.map(w => (
            <tr key={w.user._id}>
              <td style={s.td}>{w.user.name}</td>
              <td style={s.td}>{w.pending}</td>
              <td style={{ ...s.td, color: '#34d399' }}>{w.done}</td>
              <td style={{ ...s.td, color: scoreColor(w.avgScore), fontWeight: 700 }}>{w.avgScore}</td>
              <td style={s.td}>
                <div style={{ background: '#111827', borderRadius: 20, height: 8, width: 160, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(w.pending * 10, 100)}%`, height: '100%', background: w.pending >= 7 ? '#ef4444' : w.pending >= 4 ? '#f97316' : '#22c55e', borderRadius: 20, transition: 'width 0.5s' }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* All Tasks Table */}
      <div style={s.section}>All Tasks — Priority Ordered</div>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Task</th>
            <th style={s.th}>Assigned To</th>
            <th style={s.th}>Priority Score</th>
            <th style={s.th}>Status</th>
            <th style={s.th}>Deadline</th>
          </tr>
        </thead>
        <tbody>
          {allTasks.slice(0, 15).map(t => (
            <tr key={t._id}>
              <td style={s.td}>{t.title}</td>
              <td style={{ ...s.td, color: '#c4b5fd' }}>{t.assignedTo?.name || '—'}</td>
              <td style={{ ...s.td, color: scoreColor(t.priorityScore), fontWeight: 700 }}>{t.priorityScore}</td>
              <td style={s.td}>
                <span style={{ ...s.badge, background: t.status === 'done' ? '#052e16' : t.status === 'in_progress' ? '#1e3a5f' : '#1c1917', color: t.status === 'done' ? '#86efac' : t.status === 'in_progress' ? '#60a5fa' : '#d1d5db' }}>
                  {t.status.replace('_', ' ')}
                </span>
              </td>
              <td style={{ ...s.td, color: new Date(t.deadline) < new Date() ? '#f87171' : '#6b7280' }}>
                {new Date(t.deadline).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div style={s.modal} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modalBox}>
            <div style={{ color: '#a78bfa', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Assign Task</div>

            <label style={s.label}>Assign To</label>
            <select style={s.inp} value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Select member...</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>

            <label style={s.label}>Task Title *</label>
            <input style={s.inp} placeholder="Task title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />

            <label style={s.label}>Description</label>
            <textarea style={{ ...s.inp, minHeight: 70, resize: 'vertical' }} placeholder="Details..." value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />

            <label style={s.label}>Deadline *</label>
            <input style={s.inp} type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />

            <label style={s.label}>Effort: {form.effort}/10</label>
            <input type="range" min="1" max="10" value={form.effort} style={{ width: '100%', marginBottom: 12 }}
              onChange={e => setForm({ ...form, effort: Number(e.target.value) })} />

            <label style={s.label}>Impact: {form.impact}/10</label>
            <input type="range" min="1" max="10" value={form.impact} style={{ width: '100%', marginBottom: 16 }}
              onChange={e => setForm({ ...form, impact: Number(e.target.value) })} />

            <button style={{ ...s.btn, width: '100%', padding: 12, fontSize: 15 }} onClick={assignTask}>Assign Task</button>
            <button onClick={() => setShowModal(false)} style={{ width: '100%', padding: 12, background: 'transparent', border: '1px solid #374151', borderRadius: 8, color: '#9ca3af', cursor: 'pointer', marginTop: 8, fontSize: 14 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
