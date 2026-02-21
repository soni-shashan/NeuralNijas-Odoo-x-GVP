import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('fleetflow_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses (redirect to login)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('fleetflow_token');
            localStorage.removeItem('fleetflow_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    login: (data) => api.post('/auth/login', data),
    resendOTP: (data) => api.post('/auth/resend-otp', data),
    getMe: () => api.get('/auth/me')
};
// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getTrips: (params = {}) => api.get('/dashboard/trips', { params }),
    getVehicles: () => api.get('/dashboard/vehicles')
};

// Vehicle API
export const vehicleAPI = {
    getAll: (params = {}) => api.get('/vehicles', { params }),
    getById: (id) => api.get(`/vehicles/${id}`),
    create: (data) => api.post('/vehicles', data),
    update: (id, data) => api.put(`/vehicles/${id}`, data),
    toggleStatus: (id) => api.patch(`/vehicles/${id}/toggle-status`),
    delete: (id) => api.delete(`/vehicles/${id}`)
};

// Trip API
export const tripAPI = {
    getAll: (params = {}) => api.get('/trips', { params }),
    getAvailableResources: () => api.get('/trips/available-resources'),
    create: (data) => api.post('/trips', data),
    updateStatus: (id, status) => api.patch(`/trips/${id}/status`, { status }),
    delete: (id) => api.delete(`/trips/${id}`)
};

// Maintenance API
export const maintenanceAPI = {
    getAll: (params = {}) => api.get('/maintenance', { params }),
    getVehicles: () => api.get('/maintenance/vehicles'),
    create: (data) => api.post('/maintenance', data),
    updateStatus: (id, status) => api.patch(`/maintenance/${id}/status`, { status }),
    delete: (id) => api.delete(`/maintenance/${id}`)
};

// Expense API
export const expenseAPI = {
    getAll: (params = {}) => api.get('/expenses', { params }),
    getCostSummary: () => api.get('/expenses/cost-summary'),
    getCompletedTrips: () => api.get('/expenses/completed-trips'),
    create: (data) => api.post('/expenses', data),
    delete: (id) => api.delete(`/expenses/${id}`)
};

// Driver API
export const driverAPI = {
    getAll: (params = {}) => api.get('/drivers', { params }),
    updateDutyStatus: (id, dutyStatus) => api.patch(`/drivers/${id}/duty-status`, { dutyStatus }),
    updateProfile: (id, data) => api.patch(`/drivers/${id}/profile`, data)
};

// Analytics API
export const analyticsAPI = {
    getOverview: () => api.get('/analytics/overview'),
    getFuelEfficiency: () => api.get('/analytics/fuel-efficiency'),
    getCostliestVehicles: () => api.get('/analytics/costliest-vehicles'),
    getMonthlySummary: () => api.get('/analytics/monthly-summary'),
    exportCSV: (type) => api.get(`/analytics/export-csv?type=${type}`, { responseType: 'blob' })
};

export default api;
