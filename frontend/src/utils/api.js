/**
 * API Utility Functions
 * Centralized API calls for all features
 */

import axios from 'axios';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginUser = (email, password) =>
  axios.post('/auth/login', { email, password }).then((r) => r.data);

export const registerAdmin = (name, email, password) =>
  axios.post('/auth/register', { name, email, password }).then((r) => r.data);

// ─── Agents ───────────────────────────────────────────────────────────────────
export const getAgents = () =>
  axios.get('/agents').then((r) => r.data);

export const createAgent = (agentData) =>
  axios.post('/agents', agentData).then((r) => r.data);

export const updateAgent = (id, agentData) =>
  axios.put(`/agents/${id}`, agentData).then((r) => r.data);

export const deleteAgent = (id) =>
  axios.delete(`/agents/${id}`).then((r) => r.data);

// ─── Lists ────────────────────────────────────────────────────────────────────
export const uploadList = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post('/lists/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then((r) => r.data);
};

export const getLists = () =>
  axios.get('/lists').then((r) => r.data);

export const deleteBatch = (batchId) =>
  axios.delete(`/lists/batch/${batchId}`).then((r) => r.data);
