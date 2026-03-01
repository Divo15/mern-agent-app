import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { uploadList, getLists, deleteBatch } from '../utils/api';

export default function Lists() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  const fetchLists = async () => {
    try {
      const data = await getLists();
      setBatches(data.batches || []);
    } catch {
      toast.error('Failed to load lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLists(); }, []);

  const validateFile = (file) => {
    const allowed = ['.csv', '.xlsx', '.xls'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error('Invalid file type. Only CSV, XLSX, and XLS are accepted.');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max size is 10MB.');
      return false;
    }
    return true;
  };

  const handleFileSelect = (file) => {
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const result = await uploadList(selectedFile);
      setUploadResult(result);
      toast.success(result.message);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchLists();
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm('Delete this entire batch?')) return;
    try {
      await deleteBatch(batchId);
      toast.success('Batch deleted');
      fetchLists();
    } catch {
      toast.error('Failed to delete batch');
    }
  };

  const toggleBatch = (batchId) => {
    setExpandedBatch(expandedBatch === batchId ? null : batchId);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">List Distribution</div>
          <div className="page-description">Upload CSV files and distribute to agents equally</div>
        </div>
      </div>

      {/* Upload Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Upload CSV / Excel</div>
            <div className="card-subtitle">Accepts .csv, .xlsx, .xls — Required columns: FirstName, Phone, Notes</div>
          </div>
        </div>

        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
          <div className="upload-icon">⊞</div>
          {selectedFile ? (
            <>
              <div className="upload-text" style={{ color: 'var(--accent)' }}>
                ✓ {selectedFile.name}
              </div>
              <div className="upload-subtext">
                {(selectedFile.size / 1024).toFixed(1)} KB — Click to change file
              </div>
            </>
          ) : (
            <>
              <div className="upload-text">Drop your file here or click to browse</div>
              <div className="upload-subtext">Supports CSV, Excel (.xlsx, .xls)</div>
              <div className="upload-hint">MAX 10MB · FirstName · Phone · Notes</div>
            </>
          )}
        </div>

        {selectedFile && (
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
              {uploading ? '⟳ Uploading...' : '↑ Upload & Distribute'}
            </button>
            <button className="btn btn-secondary" onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}>
              Clear
            </button>
          </div>
        )}

        {/* Sample CSV format info */}
        <div style={{
          marginTop: 16,
          padding: '12px 14px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', marginBottom: 6 }}>
            EXPECTED CSV FORMAT:
          </div>
          <code style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'DM Mono, monospace' }}>
            FirstName,Phone,Notes<br />
            John,1234567890,Call in morning<br />
            Jane,9876543210,Interested in plan A
          </code>
        </div>
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div style={{ marginBottom: 24 }}>
          <div className="alert alert-success">
            ✓ Distributed {uploadResult.totalItems} items across {uploadResult.agentCount} agents
            {uploadResult.invalidRows?.length > 0 && ` (${uploadResult.invalidRows.length} invalid rows skipped)`}
          </div>
          <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            Distribution Result:
          </div>
          <div className="distribution-grid">
            {uploadResult.distribution?.map((dist) => (
              <AgentListCard key={dist._id} dist={dist} />
            ))}
          </div>
        </div>
      )}

      {/* Previous Batches */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
          Upload History
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : batches.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-text">No uploads yet</div>
              <div className="empty-subtext">Upload a CSV file to see distribution history here</div>
            </div>
          </div>
        ) : (
          batches.map((batch) => (
            <div className="batch-card" key={batch.uploadBatch}>
              <div className="batch-header" onClick={() => toggleBatch(batch.uploadBatch)}>
                <div className="batch-info">
                  <div>
                    <div className="batch-file">
                      📄 {batch.originalFileName || 'Uploaded file'}
                    </div>
                    <div className="batch-meta">
                      {new Date(batch.createdAt).toLocaleString()} · {batch.totalItems} items · {batch.distributions?.length} agents
                    </div>
                  </div>
                  <span className="badge badge-success">{batch.totalItems} items</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={(e) => { e.stopPropagation(); handleDeleteBatch(batch.uploadBatch); }}
                  >
                    Delete
                  </button>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {expandedBatch === batch.uploadBatch ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {expandedBatch === batch.uploadBatch && (
                <div className="batch-body">
                  <div className="distribution-grid">
                    {batch.distributions?.map((dist) => (
                      <AgentListCard key={dist._id} dist={dist} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Agent List Card Component ─────────────────────────────────────────────────
function AgentListCard({ dist }) {
  return (
    <div className="agent-list-card">
      <div className="agent-list-header">
        <div>
          <div className="agent-list-name">{dist.agent?.name || 'Unknown'}</div>
          <div className="agent-list-email">{dist.agent?.email}</div>
        </div>
        <div className="agent-list-count">{dist.items?.length} items</div>
      </div>
      <div className="agent-list-items">
        {dist.items?.length === 0 ? (
          <div style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
            No items assigned
          </div>
        ) : (
          dist.items?.map((item, i) => (
            <div className="agent-list-item" key={i}>
              <div className="item-name">{item.firstName}</div>
              <div className="item-phone">{item.phone}</div>
              {item.notes && <div className="item-notes">↳ {item.notes}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
