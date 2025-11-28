import api from '../utils/api';

export const fetchAchievements = (params) => api.get('/achievements', { params });
export const submitAchievement = (formData) =>
  api.post('/achievements', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const verifyAchievement = (id, payload) => api.post(`/achievements/${id}/verify`, payload);
export const deleteAchievement = (id) => api.delete(`/achievements/${id}`);

