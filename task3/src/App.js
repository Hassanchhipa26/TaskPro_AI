import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Manager from './pages/Manager';
import Navbar from './components/Navbar';

export const AuthContext = React.createContext(null);

function App() {
  const [backendReady, setBackendReady] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Backend wake up karo
  useEffect(() => {
    fetch('https://taskpro-ai-8302.onrender.com/')
      .then(() => setBackendReady(true))
      .catch(() => setBackendReady(true));
  }, []);

  // Saved user load karo
  useEffect(() => {
    const savedUser = localStorage.getItem('tp_user');
    const savedToken = localStorage.getItem('tp_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  const login = (userData, tok) => {
    setUser(userData);
    setToken(tok);
    localStorage.setItem('tp_user', JSON.stringify(userData));
    localStorage.setItem('tp_token', tok);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  // Backend ready nahi hai toh loading screen
  if (!backendReady) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0f0f1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#a78bfa', fontSize: 36, fontWeight: 700, marginBottom: 12 }}>
          ⚡ TaskPrio
        </div>
        <div style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 32 }}>
          Starting server, please wait...
        </div>
        <div style={{
          width: 44,
          height: 44,
          border: '4px solid #374151',
          borderTop: '4px solid #7c3aed',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ color: '#6b7280', fontSize: 13, marginTop: 24 }}>
          First load may take 30-60 seconds
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <BrowserRouter>
        {user && <Navbar />}
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
          <Route path="/manager" element={
            user && ['faculty_mentor', 'subject_teacher'].includes(user.role)
              ? <Manager />
              : <Navigate to="/" />
          } />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;