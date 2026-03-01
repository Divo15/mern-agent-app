import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

// Floating particle
function Particle({ x, y, size, color, delay, duration }) {
  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      boxShadow: `0 0 ${size * 3}px ${color}`,
      opacity: 0,
      animation: `particlePulse ${duration}s ease-in-out ${delay}s infinite`,
      pointerEvents: 'none',
    }} />
  );
}

const particles = [
  { x: 15, y: 20, size: 4, color: 'rgba(168,85,247,0.8)',  delay: 0,   duration: 4 },
  { x: 80, y: 15, size: 3, color: 'rgba(0,212,255,0.8)',   delay: 1.2, duration: 5 },
  { x: 70, y: 75, size: 5, color: 'rgba(168,85,247,0.6)',  delay: 0.5, duration: 3.5 },
  { x: 25, y: 80, size: 3, color: 'rgba(0,212,255,0.7)',   delay: 2,   duration: 4.5 },
  { x: 90, y: 50, size: 4, color: 'rgba(16,185,129,0.7)',  delay: 0.8, duration: 6 },
  { x: 10, y: 55, size: 3, color: 'rgba(16,185,129,0.6)',  delay: 1.5, duration: 5.5 },
  { x: 50, y: 10, size: 2, color: 'rgba(0,212,255,0.6)',   delay: 2.5, duration: 4 },
  { x: 60, y: 90, size: 4, color: 'rgba(168,85,247,0.5)',  delay: 0.3, duration: 7 },
];

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [setupForm, setSetupForm] = useState({ name: '', email: '', password: '' });
  const [setupLoading, setSetupLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (!result.success) setError(result.message || 'Login failed');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setSetupLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setupForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Admin account created! You can now log in.');
        setShowSetup(false);
        setForm({ email: setupForm.email, password: '' });
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Setup failed');
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <div className="login-page">
      <style>{`
        @keyframes particlePulse {
          0%, 100% { opacity: 0; transform: scale(0.5) translateY(0); }
          40%       { opacity: 1; transform: scale(1) translateY(-12px); }
          80%       { opacity: 0.4; transform: scale(0.8) translateY(-20px); }
        }
        @keyframes gridScroll {
          0%   { transform: translateY(0); }
          100% { transform: translateY(60px); }
        }
      `}</style>

      {/* Grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
        animation: 'gridScroll 8s linear infinite',
      }} />

      {/* Particles */}
      {particles.map((p, i) => <Particle key={i} {...p} />)}

      {/* Login Card */}
      <div
        className="login-card"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-mark" />
          <div className="login-title">
            {showSetup ? 'Create Account' : 'Welcome back'}
          </div>
          <div className="login-subtitle">
            {showSetup ? 'Set up your admin account' : 'Sign in to AgentHub'}
          </div>
        </div>

        {/* Model attribution badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 28,
          padding: '8px 16px',
          background: 'rgba(168, 85, 247, 0.06)',
          border: '1px solid rgba(168, 85, 247, 0.15)',
          borderRadius: 8,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--emerald)',
            boxShadow: '0 0 8px var(--emerald)',
            animation: 'pulse-green 2s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: 10,
            fontFamily: 'JetBrains Mono, monospace',
            color: 'var(--violet)',
            letterSpacing: '0.1em',
          }}>
            
          </span>
        </div>

        {!showSetup ? (
          <>
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 20, borderRadius: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}
            <form onSubmit={handleLogin}>
              {[
                { label: 'Email', type: 'email', field: 'email', placeholder: 'admin@example.com', delay: 0 },
                { label: 'Password', type: 'password', field: 'password', placeholder: '••••••••', delay: 80 },
              ].map(({ label, type, field, placeholder, delay }) => (
                <div
                  key={field}
                  className="form-group"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                    transition: `opacity 0.4s ease ${delay + 200}ms, transform 0.4s ease ${delay + 200}ms`,
                  }}
                >
                  <label className="form-label">{label}</label>
                  <input
                    type={type}
                    className="form-input"
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    required
                    autoFocus={field === 'email'}
                  />
                </div>
              ))}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  marginTop: 8,
                  height: 44,
                  fontSize: 14,
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'opacity 0.4s ease 400ms, transform 0.4s ease 400ms, box-shadow 0.2s ease, transform 0.2s ease',
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)',
                      borderTopColor: '#000', borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }} />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <button
                onClick={() => setShowSetup(true)}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.05em',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => e.target.style.color = 'var(--cyan)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
              >
                First time? Set up admin account →
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="alert alert-success" style={{ borderRadius: 10, marginBottom: 20 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              First-time setup — create your admin account
            </div>
            <form onSubmit={handleSetup}>
              {[
                { label: 'Full Name',  type: 'text',     field: 'name',     placeholder: 'Admin Name' },
                { label: 'Email',      type: 'email',    field: 'email',    placeholder: 'admin@example.com' },
                { label: 'Password',   type: 'password', field: 'password', placeholder: 'Min 6 characters' },
              ].map(({ label, type, field, placeholder }) => (
                <div key={field} className="form-group">
                  <label className="form-label">{label}</label>
                  <input
                    type={type}
                    className="form-input"
                    placeholder={placeholder}
                    value={setupForm[field]}
                    onChange={(e) => setSetupForm({ ...setupForm, [field]: e.target.value })}
                    required
                  />
                </div>
              ))}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={setupLoading}
                style={{ width: '100%', justifyContent: 'center', marginTop: 8, height: 44 }}
              >
                {setupLoading ? 'Creating...' : 'Create Admin Account'}
              </button>
              <button
                type="button"
                onClick={() => setShowSetup(false)}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
              >
                ← Back to Login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
