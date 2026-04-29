import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const styles = {
  nav: { 
  background: '#1e1e2e', 
  padding: '0 16px', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'space-between', 
  height: 'auto',
  minHeight: 56,
  flexWrap: 'wrap',
  gap: 8,
  paddingTop: 8,
  paddingBottom: 8
},
  brand: { color: '#a78bfa', fontWeight: 700, fontSize: 20, textDecoration: 'none', letterSpacing: 1 },
  links: { display: 'flex', gap: 20, alignItems: 'center' },
  link: { color: '#c4b5fd', textDecoration: 'none', fontSize: 14 },
  btn: { background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 14 },
  role: { color: '#6ee7b7', fontSize: 12, marginLeft: 8 }
};

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>⚡ TaskPrio</Link>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>My Tasks</Link>
        {['faculty_mentor', 'subject_teacher'].includes(user?.role) && (
          <Link to="/manager" style={styles.link}>Dashboard</Link>
        )}
        <span style={styles.role}>{user?.role?.replace('_', ' ')}</span>
        <span style={{ color: '#e2e8f0', fontSize: 14 }}>{user?.name}</span>
        <button onClick={handleLogout} style={styles.btn}>Logout</button>
      </div>
    </nav>
  );
}