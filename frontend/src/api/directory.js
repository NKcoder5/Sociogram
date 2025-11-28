import api from '../utils/api';

export const fetchDepartments = () => api.get('/directory/departments');
export const fetchClasses = (params) => api.get('/directory/classes', { params });
export const fetchStudents = (params) => api.get('/directory/students', { params });
export const fetchFaculty = (params) => api.get('/directory/faculty', { params });

