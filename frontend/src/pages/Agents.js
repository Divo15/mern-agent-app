import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAgents, createAgent, updateAgent, deleteAgent } from '../utils/api';

const COUNTRY_CODES = [
  { code: '+1', label: '+1 US/CA' },
  { code: '+44', label: '+44 UK' },
  { code: '+91', label: '+91 IN' },
  { code: '+61', label: '+61 AU' },
  { code: '+49', label: '+49 DE' },
  { code: '+33', label: '+33 FR' },
  { code: '+81', label: '+81 JP' },
  { code: '+86', label: '+86 CN' },
  { code: '+55', label: '+55 BR' },
  { code: '+971', label: '+971 UAE' },
];

const emptyForm = {
  name: '', email: '',
  mobile: { countryCode: '+1', number: '' },
  password: ''
};

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAgent, setEditAgent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchAgents = async () => {
    try {
      const data = await getAgents();
      setAgents(data.agents || []);
    } catch (err) {
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAgents(); }, []);

  const openCreate = () => {
    setEditAgent(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (agent) => {
    setEditAgent(agent);
    setForm({
      name: agent.name,
      email: agent.email,
      mobile: { countryCode: agent.mobile?.countryCode || '+1', number: agent.mobile?.number || '' },
      password: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editAgent) {
        const payload = { name: form.name, email: form.email, mobile: form.mobile };
        if (form.password) payload.password = form.password;
        await updateAgent(editAgent._id, payload);
        toast.success('Agent updated successfully');
      } else {
        await createAgent(form);
        toast.success('Agent created successfully');
      }
      setShowModal(false);
      fetchAgents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAgent(id);
      toast.success('Agent deleted');
      setDeleteConfirm(null);
      fetchAgents();
    } catch (err) {
      toast.error('Failed to delete agent');
    }
  };

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const updateMobile = (field, value) => setForm(prev => ({
    ...prev,
    mobile: { ...prev.mobile, [field]: value }
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Agents</div>
          <div className="page-description">Manage your agent roster</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Agent</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : agents.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <div className="empty-text">No agents yet</div>
            <div className="empty-subtext">Add your first agent to get started</div>
            <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: 16 }}>
              + Add Agent
            </button>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent, idx) => (
                <tr key={agent._id}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', fontSize: 12 }}>
                    {String(idx + 1).padStart(2, '0')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--accent-glow)', border: '1px solid var(--accent-dim)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 600, color: 'var(--accent)'
                      }}>
                        {agent.name?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500 }}>{agent.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace', fontSize: 12 }}>
                    {agent.email}
                  </td>
                  <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 12 }}>
                    {agent.mobile?.countryCode} {agent.mobile?.number}
                  </td>
                  <td>
                    <span className={`badge ${agent.isActive ? 'badge-success' : 'badge-warning'}`}>
                      {agent.isActive ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(agent)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => setDeleteConfirm(agent)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editAgent ? 'Edit Agent' : 'New Agent'}</div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}
              >✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="agent@example.com"
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <div className="form-input-group">
                    <select
                      className="form-select"
                      value={form.mobile.countryCode}
                      onChange={(e) => updateMobile('countryCode', e.target.value)}
                    >
                      {COUNTRY_CODES.map(cc => (
                        <option key={cc.code} value={cc.code}>{cc.label}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="1234567890"
                      value={form.mobile.number}
                      onChange={(e) => updateMobile('number', e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Password {editAgent && <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>(leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder={editAgent ? '••••••  (unchanged)' : 'Min 6 characters'}
                    value={form.password}
                    onChange={(e) => updateForm('password', e.target.value)}
                    required={!editAgent}
                    minLength={!editAgent ? 6 : undefined}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editAgent ? 'Save Changes' : 'Create Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 360 }}>
            <div className="modal-header">
              <div className="modal-title">Delete Agent</div>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm.name}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
