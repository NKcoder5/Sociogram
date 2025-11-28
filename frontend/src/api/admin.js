import api from '../utils/api';

export const fetchPendingUsers = () => api.get('/admin/pending-users');
export const approveUser = (id, payload) => api.post(`/admin/users/${id}/approve`, payload);
export const rejectUser = (id) => api.post(`/admin/users/${id}/reject`);
export const updateUserRole = (id, payload) => api.post(`/admin/users/${id}/role`, payload);

export const createDepartment = (payload) => api.post('/admin/departments', payload);
export const updateDepartment = (id, payload) => api.put(`/admin/departments/${id}`, payload);
export const deleteDepartment = (id) => api.delete(`/admin/departments/${id}`);

export const createClassSection = (payload) => api.post('/admin/classes', payload);
export const updateClassSection = (id, payload) => api.put(`/admin/classes/${id}`, payload);
export const deleteClassSection = (id) => api.delete(`/admin/classes/${id}`);

export const fetchAdminMetrics = () => api.get('/admin/dashboard/metrics');

