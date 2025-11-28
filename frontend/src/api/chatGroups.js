import api from '../utils/api';

export const joinDepartmentChat = () => api.post('/chat-groups/department/join');
export const joinClassChat = () => api.post('/chat-groups/class/join');
export const fetchAutoGroups = () => api.get('/chat-groups');

