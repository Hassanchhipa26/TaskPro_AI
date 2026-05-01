import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../App';

const s = {
  page: { minHeight: '100vh', background: '#0f0f1a', padding: '24px 16px' },
  title: { color: '#e2e8f0', fontSize: 22, fontWeight: 700, marginBottom: 24 },
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 28 },
  statCard: { background: '#1e1e2e', borderRadius: 12, padding: '20px 28px', flex: 1, minWidth: 160, border: '1px solid #374151' },
  statNum: { fontSize: 36, fontWeight: 700 },
  statLabel: { color: '#9ca3af', fontSize: 13, marginTop: 4 },
  section: { color: '#a78bfa', fontSize: 16, fontWeight: 700, marginBottom: 14 },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: 32 },
  th: { color: '#6b7280', fontSize: 11, fontWeight: 600, textAlign: 'left', padding: '8px 6px', borderBottom: '1px solid #374151', whiteSpace: 'nowrap' },
  td: { color: '#e2e8f0', fontSize: 12, padding: '10px 6px', borderBottom: '1px solid #1f2937' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  modal: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modalBox: { background: '#1e1e2e', borderRadius: 16, padding: 32, width: 440, maxHeight: '90vh', overflowY: 'auto' },
  inp: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #374151', background: '#111827', color: '#e2e8f0', fontSize: 14, marginBottom: 12, outline: 'none' },
  label: { color: '#9ca3af', fontSize: 12, marginBottom: 4, display: 'block' },
  btn: { background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  exportBtn: { background: '#065f46', color: '#6ee7b7', border: '1px solid #047857', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  empty: { color: '#6b7280', textAlign: 'center', padding: '32px', fontSize: 14 },
};

export default function Manager() {
  useContext(AuthContext);
  const [data, setData] = useState({ workload: [], summary: {} });
  const [allTasks, setAllTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', deadline: '', effort: 5, impact: 5, assignedTo: '' });
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('tp_token')}` });

  const fetchDashboard = async () => {
    try {
      const { data: d } = await API.get('/api/dashboard', { headers: getHeaders() });
      setData(d);
      setAllTasks(d.tasks || []);
    } catch (e) { console.error(e); }
  };

  const fetchMyTeam = async () => {
  try {
    const { data } = await API.get('/api/team', { headers: getHeaders() });
    setUsers(data.members || []);
  } catch (e) { console.error(e); }
};
  // eslint-disable-next-line
  useEffect(() => { fetchDashboard(); fetchMyTeam(); }, []);

  const assignTask = async () => {
    if (!form.title || !form.deadline || !form.assignedTo) return;
    setLoading(true);
    try {
      await API.post('/api/tasks', form, { headers: getHeaders() });
      setShowModal(false);
      setForm({ title: '', description: '', deadline: '', effort: 5, impact: 5, assignedTo: '' });
      fetchDashboard();
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const searchMember = async () => {
  setSearchError('');
  setSearchResult(null);
  if (!searchEmail) return;
  try {
    const { data } = await API.get(`/api/team/search?email=${searchEmail}`, { headers: getHeaders() });
    setSearchResult(data);
  } catch (e) {
    setSearchError('Member not found — make sure they registered as Team Member');
  }
};

const addToTeam = async (memberId) => {
  try {
    const { data } = await API.post('/api/team/add', { memberId }, { headers: getHeaders() });
    setUsers(data.members || []);
    setSearchResult(null);
    setSearchEmail('');
    setSearchError('');
    fetchDashboard();
  } catch (e) {
    setSearchError(e.response?.data?.message || 'Error adding member');
  }
};

const removeFromTeam = async (memberId) => {
  try {
    await API.delete(`/api/team/remove/${memberId}`, { headers: getHeaders() });
    const { data } = await API.get('/api/team', { headers: getHeaders() });
    setUsers(data.members || []);
    fetchDashboard();
  } catch (e) { console.error(e); }
};

  const exportCSV = () => {
    const rows = [['Title', 'Assigned To', 'Status', 'Priority Score', 'Deadline', 'Effort', 'Impact']];
    allTasks.forEach(t => {
      const d = new Date(t.deadline);
      const dateStr = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
      rows.push([t.title, t.assignedTo?.name || 'Unassigned', t.status, t.priorityScore, dateStr, t.effort, t.impact]);
    });
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={s.title}>Manager Dashboard</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={s.exportBtn} onClick={exportCSV}>Export CSV</button>
          <button style={s.btn} onClick={() => setShowModal(true)}>+ Assign Task</button>
        </div>
      </div>

      <div style={s.summaryRow}>
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

      {/* My Team Section */}
<div style={{ background: '#1e1e2e', borderRadius: 12, padding: 20, marginBottom: 28, border: '1px solid #7c3aed40' }}>
  <div style={s.section}>My Team — {users.length} Members</div>

  {/* Search bar */}
  <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
    <input
      style={{ ...s.inp, marginBottom: 0, flex: 1 }}
      placeholder="Search team member by email..."
      value={searchEmail}
      onChange={e => setSearchEmail(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && searchMember()}
    />
    <button style={s.btn} onClick={searchMember}>Search</button>
  </div>

  {searchError && (
    <div style={{ color: '#f87171', fontSize: 13, marginBottom: 10 }}>
      {searchError}
    </div>
  )}

  {/* Search Result */}
  {searchResult && (
    <div style={{ background: '#111827', borderRadius: 8, padding: '10px 14px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>{searchResult.name}</span>
        <span style={{ color: '#6b7280', fontSize: 12, marginLeft: 10 }}>{searchResult.email}</span>
      </div>
      <button style={{ ...s.btn, padding: '6px 14px', fontSize: 13 }}
        onClick={() => addToTeam(searchResult._id)}>
        + Add to Team
      </button>
    </div>
  )}

  {/* Team Members List */}
  {users.length === 0
    ? <div style={{ color: '#6b7280', fontSize: 13, padding: '8px 0' }}>
        No members yet — search by email to add members
      </div>
    : users.map(u => (
      <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1f2937' }}>
        <div>
          <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>{u.name}</span>
          <span style={{ color: '#6b7280', fontSize: 12, marginLeft: 10 }}>{u.email}</span>
        </div>
        <button onClick={() => removeFromTeam(u._id)}
          style={{ background: 'transparent', border: '1px solid #374151', borderRadius: 6, color: '#f87171', cursor: 'pointer', padding: '4px 10px', fontSize: 12 }}>
          Remove
        </button>
      </div>
    ))
  }
</div>

      <div style={s.section}>Team Workload Distribution</div>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={s.table}>
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
            {data.workload?.length === 0 && (
              <tr><td colSpan="5" style={s.empty}>No team members yet — assign a task first</td></tr>
            )}
            {data.workload?.map(w => (
              <tr key={w.user._id}>
                <td style={s.td}>{w.user.name}</td>
                <td style={s.td}>{w.pending}</td>
                <td style={{ ...s.td, color: '#34d399' }}>{w.done}</td>
                <td style={{ ...s.td, color: scoreColor(w.avgScore), fontWeight: 700 }}>{w.avgScore}</td>
                <td style={s.td}>
                  <div style={{ background: '#111827', borderRadius: 20, height: 8, width: 80, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(w.pending * 10, 100)}%`, height: '100%', background: w.pending >= 7 ? '#ef4444' : w.pending >= 4 ? '#f97316' : '#22c55e', borderRadius: 20 }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={s.section}>All Tasks — Priority Ordered</div>
      <div style={{ overflowX: 'auto', width: '100%' }}>
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
            {allTasks.length === 0 && (
              <tr><td colSpan="5" style={s.empty}>No tasks yet — click + Assign Task</td></tr>
            )}
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
      </div>

      {showModal && (
        <div style={s.modal} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modalBox}>
            <div style={{ color: '#a78bfa', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Assign Task</div>

            <label style={s.label}>Assign To *</label>
            <select style={s.inp} value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Select member...</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>

            <label style={s.label}>Task Title *</label>
            <input style={s.inp} placeholder="Task title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />

            <label style={s.label}>Description</label>
            <textarea style={{ ...s.inp, minHeight: 70, resize: 'vertical' }} placeholder="Details..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

            <label style={s.label}>Deadline *</label>
            <input style={s.inp} type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />

            <label style={s.label}>Effort: {form.effort}/10</label>
            <input type="range" min="1" max="10" value={form.effort} style={{ width: '100%', marginBottom: 12 }} onChange={e => setForm({ ...form, effort: Number(e.target.value) })} />

            <label style={s.label}>Impact: {form.impact}/10</label>
            <input type="range" min="1" max="10" value={form.impact} style={{ width: '100%', marginBottom: 16 }} onChange={e => setForm({ ...form, impact: Number(e.target.value) })} />

            <button style={{ ...s.btn, width: '100%', padding: 12, fontSize: 15, opacity: loading ? 0.7 : 1 }} onClick={assignTask} disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Task'}
            </button>
            <button onClick={() => setShowModal(false)} style={{ width: '100%', padding: 12, background: 'transparent', border: '1px solid #374151', borderRadius: 8, color: '#9ca3af', cursor: 'pointer', marginTop: 8, fontSize: 14 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}