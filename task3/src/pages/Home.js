import React, { useState, useEffect, useContext } from 'react';
// import axios from 'axios';
import API from '../api'; 
import { AuthContext } from '../App';
import TaskCard from '../components/TaskCard';
import AlertBanner from '../components/AlertBanner';

const s = {
  page: { minHeight: '100vh', background: '#0f0f1a', padding: '24px 32px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { color: '#e2e8f0', fontSize: 22, fontWeight: 700 },
  addBtn: { background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  modal: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modalBox: { background: '#1e1e2e', borderRadius: 16, padding: 32, width: 440, maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { color: '#a78bfa', fontSize: 18, fontWeight: 700, marginBottom: 20 },
  inp: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #374151', background: '#111827', color: '#e2e8f0', fontSize: 14, marginBottom: 12, outline: 'none' },
  label: { color: '#9ca3af', fontSize: 12, marginBottom: 4, display: 'block' },
  row: { display: 'flex', gap: 12 },
  saveBtn: { width: '100%', padding: 12, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer', fontWeight: 600, marginTop: 8 },
  cancelBtn: { width: '100%', padding: 12, background: 'transparent', color: '#9ca3af', border: '1px solid #374151', borderRadius: 8, fontSize: 15, cursor: 'pointer', marginTop: 8 },
  empty: { color: '#6b7280', textAlign: 'center', marginTop: 60, fontSize: 16 },
  formula: { background: '#111827', border: '1px solid #374151', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#a78bfa' },
  tabs: { display: 'flex', gap: 8, marginBottom: 20 },
  tab: { padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
};

export default function Home() {
  const { token , user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', description: '', deadline: '', effort: 5, impact: 5 });
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/api/tasks/my', { headers });
      setTasks(data);
    } catch (e) { console.error(e); }
  };

  const fetchAlerts = async () => {
    try {
      const { data } = await API.get('/api/tasks/alerts', { headers });
      setAlerts(data);
    } catch (e) { console.error(e); }
  };

  // eslint-disable-next-line
useEffect(() => { fetchTasks(); fetchAlerts(); }, []);

  const createTask = async () => {
    if (!form.title || !form.deadline) return;
    setLoading(true);
    try {
      await API.post('/api/tasks', { ...form, assignedTo: user.id }, { headers });
      setShowModal(false);
      setForm({ title: '', description: '', deadline: '', effort: 5, impact: 5 });
      fetchTasks();
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await API.put(`/api/tasks/${id}`, { status }, { headers });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await API.delete(`/api/tasks/${id}`, { headers });
    fetchTasks();
  };

  const dismissAlert = async (id) => {
    await API.put(`/api/tasks/alerts/${id}/read`, {}, { headers });
    setAlerts(alerts.filter(a => a._id !== id));
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div style={s.page} className="page-wrap">
      {alerts.map(a => (
        <AlertBanner key={a._id} alert={a} onDismiss={() => dismissAlert(a._id)} />
      ))}

      <div style={s.header} className="header-row">
        <div>
          <div style={s.title}>My Tasks</div>
          <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            {tasks.length} active • sorted by AI priority score
          </div>
        </div>
        <button style={s.addBtn} onClick={() => setShowModal(true)}>+ New Task</button>
      </div>

      <div style={s.tabs} className="tabs-row">
        {['all', 'todo', 'in_progress'].map(f => (
          <button key={f} style={{ ...s.tab, background: filter === f ? '#7c3aed' : '#1e1e2e', color: filter === f ? '#fff' : '#9ca3af', border: filter === f ? 'none' : '1px solid #374151' }}
            onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'todo' ? 'To Do' : 'In Progress'}
          </button>
        ))}
      </div>

      {filtered.length === 0
        ? <div style={s.empty}>No tasks here. Create one!</div>
        : <div style={s.grid} className="task-grid">
            {filtered.map(task => (
              <TaskCard key={task._id} task={task} onStatusChange={updateStatus} onDelete={deleteTask} />
            ))}
          </div>
      }

      {showModal && (
        <div style={s.modal} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modalBox} className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={s.modalTitle}>Create New Task</div>

            <div style={s.formula}>
              AI Score = (Impact × 0.4) + (Urgency × 0.4) + (Easy Factor × 0.2)
            </div>

            <label style={s.label}>Task Title *</label>
            <input style={s.inp} placeholder="e.g. Prepare project report" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} />

            <label style={s.label}>Description</label>
            <textarea style={{ ...s.inp, minHeight: 80, resize: 'vertical' }} placeholder="What needs to be done?"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

            <label style={s.label}>Deadline *</label>
            <input style={s.inp} type="datetime-local" value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })} />

            <div style={s.row}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Effort (1=easy, 10=hard): {form.effort}</label>
                <input type="range" min="1" max="10" value={form.effort} style={{ width: '100%', marginBottom: 12 }}
                  onChange={e => setForm({ ...form, effort: Number(e.target.value) })} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Impact (1=low, 10=high): {form.impact}</label>
                <input type="range" min="1" max="10" value={form.impact} style={{ width: '100%', marginBottom: 12 }}
                  onChange={e => setForm({ ...form, impact: Number(e.target.value) })} />
              </div>
            </div>

            <button style={s.saveBtn} onClick={createTask} disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
            <button style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}   
