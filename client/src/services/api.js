import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users')
};

export const files = {
  upload: (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: () => api.get('/files'),
  getShared: () => api.get('/files/shared'),
  download: (id, link) => api.get(`/files/download/${id}${link ? `?link=${link}` : ''}`, {
    responseType: 'blob'
  }),
  delete: (id) => api.delete(`/files/${id}`)
};

export const share = {
  shareWithUsers: (data) => api.post('/share/users', data),
  generateLink: (data) => api.post('/share/link', data),
  getByLink: (link) => api.get(`/share/link/${link}`),
  getShareInfo: (fileId) => api.get(`/share/file/${fileId}`),
  revokeAccess: (fileId, userId) => api.delete(`/share/revoke/${fileId}/${userId}`)
};

export default api;