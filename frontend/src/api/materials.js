import api from '../utils/api';

export const fetchMaterials = (params) => api.get('/materials', { params });
export const getMaterial = (id) => api.get(`/materials/${id}`);
export const uploadMaterial = (formData) =>
  api.post('/materials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteMaterial = (id) => api.delete(`/materials/${id}`);
export const addMaterialComment = (id, payload) => api.post(`/materials/${id}/comments`, payload);

