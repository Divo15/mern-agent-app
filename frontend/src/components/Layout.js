import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  {
    to: '/dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    label: 'Dashboard',
  },
  {
    to: '/agents',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        <circle cx="19" cy="8" r="2" strokeWidth="1.5"/><path d="M22 14c-1.3-.8-2.8-1.2-3-1.2"/>
      </svg>
    ),
    label: 'Agents',
  },
  {
    to: '/lists',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    label: 'Lists',
  },
];

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/agents': 'Agent Management',
  '/lists': 'List Distribution',
};

// Floating orb SVG background
function FloatingOrbs() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden',
    }}>
      {/* Orb 1 - violet, top left */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
        animation: 'orbFloat1 18s ease-in-out infinite',
        filter: 'blur(2px)',
      }} />
      {/* Orb 2 - cyan, bottom right */}
      <div style={{
        position: 'absolute',
        bottom: '5%',
        right: '10%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
        animation: 'orbFloat2 24s ease-in-out infinite',
        filter: 'blur(2px)',
      }} />
      {/* Orb 3 - emerald, center */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)',
        animation: 'orbFloat3 30s ease-in-out infinite',
        filter: 'blur(2px)',
      }} />
      <style>{`
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25%       { transform: translate(30px, -20px) scale(1.05); }
          50%       { transform: translate(-10px, 40px) scale(0.95); }
          75%       { transform: translate(-30px, -10px) scale(1.02); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(-40px, 20px) scale(1.08); }
          66%       { transform: translate(20px, -30px) scale(0.93); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50%       { transform: translate(-50%, -50%) scale(1.15); }
        }
      `}</style>
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'App';
  const [uptime, setUptime] = useState(0);

  // Uptime ticker for the AI status
  useEffect(() => {
    const interval = setInterval(() => setUptime(u => u + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="layout">
      <FloatingOrbs />

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark"></div>
          <div className="sidebar-logo-name">AgentHub</div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* System status in sidebar */}
        <div style={{
          margin: '0 16px 12px',
          padding: '12px 14px',
          background: 'rgba(16, 185, 129, 0.06)',
          border: '1px solid rgba(16, 185, 129, 0.15)',
          borderRadius: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{
              width: 5, height: 5, borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 6px #10b981',
              animation: 'pulse-green 2s ease-in-out infinite'
            }} />
            <span style={{ fontSize: 9, color: '#10b981', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
              SYSTEM ONLINE
            </span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            Uptime: {formatUptime(uptime)}
          </div>
        </div>

        <div className="sidebar-footer">
          {user && (
            <div className="user-info">
              <div className="user-avatar">
                {user.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <div className="user-name">{user.name}</div>
                <div className="user-role">admin</div>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={logout}>
            Sign out →
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Gradient accent line */}
            <div style={{
              width: 3,
              height: 20,
              borderRadius: 2,
              background: 'linear-gradient(180deg, var(--violet), var(--cyan))',
            }} />
            <span className="topbar-title">{title}</span>
          </div>

          <div className="topbar-right">
            <span className="topbar-date">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>

            {/* AI Status badge */}
            <div className="ai-status">
              <div className="ai-status-dot" />
              AI ONLINE
            </div>

            {/* Model tag */}
            <div style={{
              padding: '4px 10px',
              background: 'rgba(168, 85, 247, 0.08)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              borderRadius: 6,
              fontSize: 9,
              fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--violet)',
              letterSpacing: '0.06em',
            }}>
              
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
