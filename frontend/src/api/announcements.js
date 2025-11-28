import api from '../utils/api';

export const fetchAnnouncements = (params) => api.get('/announcements', { params });
export const createAnnouncement = (payload) => api.post('/announcements', payload);
export const updateAnnouncement = (id, payload) => api.put(`/announcements/${id}`, payload);
export const deleteAnnouncement = (id) => api.delete(`/announcements/${id}`);

