import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAgents, getLists } from '../utils/api';
import { useAuth } from '../context/AuthContext';

// Animated counter hook
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quart
      const ease = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(ease * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}

const statConfig = [
  {
    key: 'agents',
    label: 'Active Agents',
    accentClass: 'violet',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
    suffix: '',
  },
  {
    key: 'batches',
    label: 'Upload Batches',
    accentClass: 'cyan',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
    suffix: '',
  },
  {
    key: 'totalItems',
    label: 'Items Distributed',
    accentClass: 'emerald',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    suffix: '',
  },
];

function StatCard({ value, label, accentClass, icon, delay = 0 }) {
  const animatedValue = useCountUp(value, 1000 + delay);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`stat-card ${accentClass}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
      }}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{animatedValue.toLocaleString()}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ agents: 0, batches: 0, totalItems: 0 });
  const [recentBatches, setRecentBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, listsRes] = await Promise.all([getAgents(), getLists()]);
        const batches = listsRes.batches || [];
        const totalItems = batches.reduce((sum, b) => sum + b.totalItems, 0);
        setStats({ agents: agentsRes.count || 0, batches: batches.length, totalItems });
        setRecentBatches(batches.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="loading-screen" style={{ minHeight: 'auto', padding: 80 }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div>
      {/* ── Welcome Banner ── */}
      <div className="welcome-banner">
        <div className="welcome-banner-orb" />
        <div>
          <div style={{
            fontSize: 10,
            color: 'var(--violet)',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}>
            Welcome back
          </div>
          <div style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: 4,
            background: 'linear-gradient(135deg, #fff 0%, var(--cyan) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {user?.name || 'Admin'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Your intelligent agent management hub — everything in one view.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <Link to="/agents" className="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Agent
          </Link>
          <Link to="/lists" className="btn btn-secondary">
            Upload CSV
          </Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        {statConfig.map((s, i) => (
          <StatCard
            key={s.key}
            value={stats[s.key]}
            label={s.label}
            accentClass={s.accentClass}
            icon={s.icon}
            delay={i * 100}
          />
        ))}
      </div>

      {/* ── Recent Uploads Table ── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Recent Uploads</div>
            <div className="card-subtitle">Latest distributed batches</div>
          </div>
          <Link to="/lists" className="btn btn-secondary btn-sm">
            View all →
          </Link>
        </div>

        {recentBatches.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </span>
            <div className="empty-text">No uploads yet</div>
            <div className="empty-subtext">Upload a CSV to distribute lists among agents</div>
            <Link to="/lists" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>
              Upload Now
            </Link>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Total Items</th>
                  <th>Agents</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBatches.map((batch) => (
                  <tr key={batch.uploadBatch}>
                    <td style={{ fontWeight: 600, fontSize: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: 'rgba(0, 212, 255, 0.08)',
                          border: '1px solid rgba(0, 212, 255, 0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </div>
                        {batch.originalFileName || 'Unknown file'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{batch.totalItems} items</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{batch.distributions?.length || 0} agents</td>
                    <td style={{
                      color: 'var(--text-muted)',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11,
                    }}>
                      {new Date(batch.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className="badge badge-success">● Distributed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Link to="/agents" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(168,85,247,0.15)';
              e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
              e.currentTarget.style.borderColor = '';
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10, marginBottom: 14,
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--violet)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                <line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/>
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>
              Manage Agents
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Add, edit, or remove agents from your team roster
            </div>
          </div>
        </Link>

        <Link to="/lists" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,212,255,0.12)';
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
              e.currentTarget.style.borderColor = '';
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10, marginBottom: 14,
              background: 'rgba(0, 212, 255, 0.08)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--cyan)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 16 12 12 8 16"/>
                <line x1="12" y1="12" x2="12" y2="21"/>
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>
              Upload &amp; Distribute
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Upload CSV files and distribute contacts to agents equally
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
