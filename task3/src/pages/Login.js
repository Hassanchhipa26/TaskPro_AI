import React, { useState, useContext } from "react";
import API from "../api";
import { AuthContext } from "../App";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "team_member",
  });
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);

  const handle = async () => {
    try {
      const url = isRegister ? "/api/auth/register" : "/api/auth/login";

      const { data } = await API.post(url, form);
      login(data.user, data.token);
    } catch (e) {
      setError(e.response?.data?.message || "Error");
    }
  };

  const s = {
    wrap: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0f0f1a",
    },
    box: { background: "#1e1e2e", borderRadius: 16, padding: 40, width: 380 },
    title: {
      color: "#a78bfa",
      fontSize: 28,
      fontWeight: 700,
      marginBottom: 24,
    },
    inp: {
      width: "100%",
      padding: "10px 14px",
      borderRadius: 8,
      border: "1px solid #374151",
      background: "#111827",
      color: "#e2e8f0",
      fontSize: 14,
      marginBottom: 12,
      outline: "none",
    },
    btn: {
      width: "100%",
      padding: "12px",
      background: "#7c3aed",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      fontSize: 16,
      cursor: "pointer",
      fontWeight: 600,
    },
    err: { color: "#f87171", fontSize: 13, marginBottom: 8 },
    link: {
      color: "#a78bfa",
      cursor: "pointer",
      fontSize: 13,
      textAlign: "center",
      marginTop: 12,
    },
  };

  return (
    <div style={s.wrap}>
      <div style={s.box}>
        <div style={s.title}>⚡ TaskPrio</div>
        {isRegister && (
          <input
            style={s.inp}
            placeholder="Full Name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}
        <input
          style={s.inp}
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          style={s.inp}
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {isRegister && (
          <select
            style={s.inp}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="team_member">Team Member</option>
            <option value="faculty_mentor">Faculty Mentor</option>
            <option value="subject_teacher">Subject Teacher</option>
          </select>
        )}
        {error && <div style={s.err}>{error}</div>}
        <button style={s.btn} onClick={handle}>
          {isRegister ? "Register" : "Login"}
        </button>
        <div style={s.link} onClick={() => setIsRegister(!isRegister)}>
          {isRegister
            ? "Already have account? Login"
            : "Don't have account? Register"}
        </div>
      </div>
    </div>
  );
}
