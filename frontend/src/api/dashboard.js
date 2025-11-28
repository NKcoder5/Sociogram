import api from '../utils/api';

export const fetchStudentDashboard = () => api.get('/dashboard/student');
export const fetchFacultyDashboard = () => api.get('/dashboard/faculty');

