import React from 'react';

// import axios from 'axios';
// import { useEffect } from 'react';

const typeStyle = {
  overdue:    { background: '#450a0a', border: '#ef4444', icon: '🚨' },
  approaching: { background: '#431407', border: '#f97316', icon: '⏰' },
  completed:  { background: '#052e16', border: '#22c55e', icon: '✅' },
};

export default function AlertBanner({ alert, onDismiss }) {
  const ts = typeStyle[alert.type] || typeStyle.approaching;
  return (
    <div style={{
      background: ts.background,
      border: `1px solid ${ts.border}`,
      borderRadius: 8,
      padding: '10px 16px',
      marginBottom: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <span style={{ color: '#e2e8f0', fontSize: 14 }}>
        {ts.icon} {alert.message}
      </span>
      <button onClick={onDismiss} style={{
        background: 'transparent', border: 'none', color: '#9ca3af',
        cursor: 'pointer', fontSize: 18, marginLeft: 16, padding: 0
      }}>×</button>
    </div>
  );
}   