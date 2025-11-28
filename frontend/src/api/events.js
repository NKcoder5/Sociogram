import api from '../utils/api';

export const fetchEvents = (params) => api.get('/events', { params });
export const getEvent = (id) => api.get(`/events/${id}`);
export const createEvent = (formData) =>
  api.post('/events', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateEvent = (id, formData) =>
  api.put(`/events/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteEvent = (id) => api.delete(`/events/${id}`);
export const registerForEvent = (id) => api.post(`/events/${id}/register`);

